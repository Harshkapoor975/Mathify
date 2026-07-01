const {
    addPlayer,
    findMatch,
    findSurvivalMatch,
    removePlayer
} = require("../matchmaking/matchmaking.service");

const {
    GAME_STATES,
    GAME_TYPES,
    createGame,
    createSurvivalGame,
    createGameWithType,
    submitAnswer,
    submitSurvivalAnswer,
    endSurvivalGame,
    getCurrentQuestion,
    pauseGame,
    resumeGame,
    abortGame
} = require("./game.engine");

const games = require("./game.store");
const redis = require("../../config/redis");
const {
    ABORT_MS,
    connectUserSession,
    getUserSession,
    markUserReconnecting,
    setUserRoom,
    removeUserSession
} = require("../user/user.session.store");
const {
    persistTerminalGame
} = require("./game.persistence");

// lives outside registerGameHandlers — persists across all socket connections
const survivalTimers = new Map();

// ── helper functions ──────────────────────────────────────────

function getSocketUserId(socket) {
    if (!socket.user || socket.user.isGuest) return socket.id;
    return socket.user._id?.toString() || socket.user.id?.toString() || socket.id;
}

async function saveRematchMetadata(game) {
    try {
        const [p1Id, p2Id] = game.playerIds;
        const p1Session = getUserSession(p1Id);
        const p2Session = getUserSession(p2Id);

        const rematchMeta = {
            player1Id: p1Id,
            player2Id: p2Id,
            player1SocketId: p1Session?.socketId || null,
            player2SocketId: p2Session?.socketId || null,
            gameType: game.type || GAME_TYPES.BLITZ,
            accepted: {
                [p1Id]: false,
                [p2Id]: false
            }
        };

        await redis.set(`rematch:${game.id}`, JSON.stringify(rematchMeta), "EX", 300);
        console.log(`[REMATCH DEBUG] Metadata created for room: ${game.id}`);
        console.log("[REMATCH DEBUG] Payload:", JSON.stringify(rematchMeta, null, 2));
    } catch (err) {
        console.error("[REMATCH DEBUG] Failed to save rematch metadata to Redis:", err.message);
    }
}

function getOpponentId(game, userId) {
    return game.playerIds.find((id) => id !== userId) || null;
}

function getProgress(game) {
    if (game.type === GAME_TYPES.Survival) {
        return Object.fromEntries(
            game.playerIds.map((id) => [id, game.players[id]?.score ?? 0])
        );
    }

    return Object.fromEntries(
        game.playerIds.map((id) => [
            id,
            game.players[id]?.currentQuestionIndex ?? 0
        ])
    );
}

async function persistAndEmitAbort(io, game, abortedBy) {
    const abortedGame = abortGame(game.id, abortedBy);

    if (!abortedGame || abortedGame.state !== GAME_STATES.ABORTED) return;

    // clear survival timer if exists
    const timer = survivalTimers.get(game.id);
    if (timer) {
        clearTimeout(timer);
        survivalTimers.delete(game.id);
    }

    io.to(abortedGame.id).emit("game_aborted", {
        roomId: abortedGame.id,
        abortedBy
    });

    try {
        await persistTerminalGame(abortedGame);
    } catch (err) {
        console.error("Match abort persistence failed:", err.message);
    }
}

function emitGameResumed(socket, io, game, userId) {
    const question = getCurrentQuestion(game, userId);

    socket.join(game.id);

    socket.emit("game_resumed", {
        roomId: game.id,
        question: question?.text,
        myUserId: userId,
        opponentId: getOpponentId(game, userId),
        progress: getProgress(game)
    });

    socket.to(game.id).emit("game_resumed", {
        roomId: game.id,
        state: game.state,
        resumedBy: userId,
        progress: getProgress(game)
    });

    io.to(game.id).emit("game_state_changed", {
        roomId: game.id,
        state: game.state,
        resumedBy: userId
    });
}

// ── main handler ──────────────────────────────────────────────

function registerGameHandlers(io, socket) {
    const userId = getSocketUserId(socket);
    const isGuest = Boolean(socket.user?.isGuest);
    const previousSession = getUserSession(userId);

    connectUserSession({
        userId,
        socketId: socket.id,
        isGuest,
        roomId: previousSession?.roomId ?? null
    });

    if (previousSession?.roomId) {
        const game = games.get(previousSession.roomId);

        if (game?.state === GAME_STATES.PAUSED) {
            const resumedGame = resumeGame(game.id, userId);

            if (resumedGame?.state === GAME_STATES.PLAYING) {
                emitGameResumed(socket, io, resumedGame, userId);
            }
        }
    }

    // ── blitz matchmaking ─────────────────────────────────────

    socket.on("find_match", () => {
        console.log("BLITZ MATCH REQUEST from userId:", userId);

        addPlayer({ socketId: socket.id, userId }, "Blitz");

        const match = findMatch();

        if (!match) {
            socket.emit("waiting_for_player");
            return;
        }

        const { player1, player2 } = match;

        const player1Socket = io.sockets.sockets.get(player1.socketId);
        const player2Socket = io.sockets.sockets.get(player2.socketId);

        if (!player1Socket || !player2Socket) {
            if (player1Socket) addPlayer(player1);
            if (player2Socket) addPlayer(player2);
            socket.emit("waiting_for_player");
            return;
        }

        const roomId = `room_${Date.now()}`;

        player1Socket.join(roomId);
        player2Socket.join(roomId);

        setUserRoom(player1.userId, roomId);
        setUserRoom(player2.userId, roomId);

        const game = createGame(roomId, player1.userId, player2.userId);

        const p1Question = getCurrentQuestion(game, player1.userId);
        const p2Question = getCurrentQuestion(game, player2.userId);

        io.to(roomId).emit("match_found", {
            roomId,
            players: [player1.userId, player2.userId],
            state: game.state
        });

        player1Socket.emit("game_started", {
            roomId,
            question: p1Question.text,
            opponentId: player2.userId,
            myUserId: player1.userId,
            state: game.state
        });

        player2Socket.emit("game_started", {
            roomId,
            question: p2Question.text,
            opponentId: player1.userId,
            myUserId: player2.userId,
            state: game.state
        });

        console.log("BLITZ GAME STARTED:", roomId, player1.userId, "vs", player2.userId);
    });

    // ── survival matchmaking ──────────────────────────────────

    socket.on("find_survival_match", () => {
        console.log("SURVIVAL MATCH REQUEST from userId:", userId);

        addPlayer({ socketId: socket.id, userId }, "Survival");

        const match = findSurvivalMatch();

        if (!match) {
            socket.emit("waiting_for_player");
            return;
        }

        const { player1, player2 } = match;

        const player1Socket = io.sockets.sockets.get(player1.socketId);
        const player2Socket = io.sockets.sockets.get(player2.socketId);

        if (!player1Socket || !player2Socket) {
            if (player1Socket) addPlayer(player1);
            if (player2Socket) addPlayer(player2);
            socket.emit("waiting_for_player");
            return;
        }

        const roomId = `room_${Date.now()}`;

        player1Socket.join(roomId);
        player2Socket.join(roomId);

        setUserRoom(player1.userId, roomId);
        setUserRoom(player2.userId, roomId);

        const game = createSurvivalGame(roomId, player1.userId, player2.userId);

        // 60s server timer
        const timer = setTimeout(async () => {
            const finishedGame = endSurvivalGame(roomId);
            if (!finishedGame) return;

            io.to(roomId).emit("game_over", {
                winner: finishedGame.winner,
                scores: Object.fromEntries(
                    finishedGame.playerIds.map(id => [id, finishedGame.players[id].score])
                )
            });

            try {
                await persistTerminalGame(finishedGame);
            } catch (err) {
                console.error("Survival persistence failed:", err.message);
            }

            await saveRematchMetadata(finishedGame);

            survivalTimers.delete(roomId);
        }, 60_000);

        survivalTimers.set(roomId, timer);

        io.to(roomId).emit("match_found", {
            roomId,
            players: [player1.userId, player2.userId],
            state: game.state,
            gameType: GAME_TYPES.Survival
        });

        player1Socket.emit("game_started", {
            roomId,
            question: game.currentQuestion.text,
            opponentId: player2.userId,
            myUserId: player1.userId,
            state: game.state,
            gameType: GAME_TYPES.Survival,
            endsAt: game.endsAt
        });

        player2Socket.emit("game_started", {
            roomId,
            question: game.currentQuestion.text,
            opponentId: player1.userId,
            myUserId: player2.userId,
            state: game.state,
            gameType: GAME_TYPES.Survival,
            endsAt: game.endsAt
        });

        console.log("SURVIVAL GAME STARTED:", roomId, player1.userId, "vs", player2.userId);
    });

    // ── answer submission — routes by game type ───────────────

    socket.on("submit_answer", async (data) => {
        const { roomId, answer } = data;

        const game = games.get(roomId);
        if (!game) {
            socket.emit("game_error", "Game not found");
            return;
        }

        if (game.type === GAME_TYPES.Survival) {
            const result = submitSurvivalAnswer(roomId, userId, answer);

            if (result.error) {
                socket.emit("game_error", result.error);
                return;
            }

            if (!result.correct) {
                socket.emit("answer_result", { correct: false });
                return;
            }

            io.to(roomId).emit("survival_point", {
                scorerId: result.scorerId,
                scores: result.scores,
                nextQuestion: result.nextQuestion
            });

            return;
        }

        // blitz
        const result = submitAnswer(roomId, userId, answer);

        if (result.error) {
            socket.emit("game_error", result.error);
            return;
        }

        socket.emit("answer_result", result);

        io.to(roomId).emit("progress_update", {
            playerId: userId,
            progress: result.progress
        });

        if (result.winner) {
            io.to(roomId).emit("game_over", { winner: result.winner });

            try {
                await persistTerminalGame(game);
            } catch (err) {
                console.error("Match completion persistence failed:", err.message);
            }

            await saveRematchMetadata(game);
        }
    });

    // ── abort ─────────────────────────────────────────────────

    socket.on("abort_game", async ({ roomId } = {}) => {
        const game = roomId ? games.get(roomId) : null;

        if (!game) {
            socket.emit("game_error", "Game not found");
            return;
        }

        await persistAndEmitAbort(io, game, userId);
    });

    // ── rematch ───────────────────────────────────────────────

    socket.on("rematch_request", async ({ roomId }) => {
        console.log(`[REMATCH DEBUG] Request received. RoomId: ${roomId}, UserId: ${userId}, SocketId: ${socket.id}`);
        const data = await redis.get(`rematch:${roomId}`);
        if (!data) {
            console.warn(`[REMATCH DEBUG] Request failed: No metadata in Redis for room: ${roomId}`);
            socket.emit("rematch_error", "Rematch window expired.");
            return;
        }

        try {
            const rematchMeta = JSON.parse(data);
            console.log(`[REMATCH DEBUG] Loaded rematchMeta:`, JSON.stringify(rematchMeta, null, 2));
            rematchMeta.accepted[userId] = true;

            // Dynamically update the active socket ID for this player
            if (rematchMeta.player1Id === userId) {
                rematchMeta.player1SocketId = socket.id;
            } else {
                rematchMeta.player2SocketId = socket.id;
            }
            console.log(`[REMATCH DEBUG] Updated rematchMeta with active socket:`, JSON.stringify(rematchMeta, null, 2));

            // Save updated metadata back to Redis
            await redis.set(`rematch:${roomId}`, JSON.stringify(rematchMeta), "EX", 300);

            // Get opponent's socket ID
            const opponentSocketId = rematchMeta.player1Id === userId ? rematchMeta.player2SocketId : rematchMeta.player1SocketId;
            console.log(`[REMATCH DEBUG] Target opponent socket ID: ${opponentSocketId}`);

            const opponentSocket = io.sockets.sockets.get(opponentSocketId);
            if (opponentSocket) {
                opponentSocket.emit("opponent_requested_rematch", { roomId, requestedBy: userId });
                console.log(`[REMATCH DEBUG] Successfully emitted opponent_requested_rematch to ${opponentSocketId}`);
            } else {
                console.warn(`[REMATCH DEBUG] Opponent socket ${opponentSocketId} NOT found in active connections list!`);
            }
        } catch (err) {
            console.error("[REMATCH DEBUG] Failed to parse rematch request:", err.message);
            socket.emit("rematch_error", "Internal rematch error.");
        }
    });

    socket.on("rematch_response", async ({ roomId, accept }) => {
        console.log(`[REMATCH DEBUG] Response received. RoomId: ${roomId}, UserId: ${userId}, SocketId: ${socket.id}, Accept: ${accept}`);
        const data = await redis.get(`rematch:${roomId}`);
        if (!data) {
            console.warn(`[REMATCH DEBUG] Response failed: No metadata in Redis for room: ${roomId}`);
            socket.emit("rematch_error", "Rematch expired.");
            return;
        }

        try {
            const rematchMeta = JSON.parse(data);
            console.log(`[REMATCH DEBUG] Loaded rematchMeta for response:`, JSON.stringify(rematchMeta, null, 2));

            if (accept) {
                rematchMeta.accepted[userId] = true;

                // Dynamically update the active socket ID for this player
                if (rematchMeta.player1Id === userId) {
                    rematchMeta.player1SocketId = socket.id;
                } else {
                    rematchMeta.player2SocketId = socket.id;
                }

                // Check if BOTH players have accepted
                const allAccepted = Object.values(rematchMeta.accepted).every(val => val === true);
                console.log(`[REMATCH DEBUG] All accepted: ${allAccepted}`);

                if (allAccepted) {
                    // Both accepted! Generate a new game
                    const newRoomId = `room_${Date.now()}`;
                    console.log(`[REMATCH DEBUG] Creating new game. newRoomId: ${newRoomId}, gameType: ${rematchMeta.gameType}`);
                    
                    const newGame = createGameWithType(
                        newRoomId,
                        rematchMeta.player1Id,
                        rematchMeta.player2Id,
                        rematchMeta.gameType
                    );

                    // Update user sessions to point to the new room ID
                    setUserRoom(rematchMeta.player1Id, newRoomId);
                    setUserRoom(rematchMeta.player2Id, newRoomId);

                    // Join both player sockets to the new room
                    const player1Socket = io.sockets.sockets.get(rematchMeta.player1SocketId);
                    const player2Socket = io.sockets.sockets.get(rematchMeta.player2SocketId);

                    if (player1Socket) {
                        player1Socket.join(newRoomId);
                        console.log(`[REMATCH DEBUG] Socket ${rematchMeta.player1SocketId} joined room ${newRoomId}`);
                    } else {
                        console.error(`[REMATCH DEBUG] Player 1 Socket ${rematchMeta.player1SocketId} NOT found during game creation!`);
                    }

                    if (player2Socket) {
                        player2Socket.join(newRoomId);
                        console.log(`[REMATCH DEBUG] Socket ${rematchMeta.player2SocketId} joined room ${newRoomId}`);
                    } else {
                        console.error(`[REMATCH DEBUG] Player 2 Socket ${rematchMeta.player2SocketId} NOT found during game creation!`);
                    }

                    // Emit rematch_accepted to notify clients to reset rematch UI states
                    if (player1Socket) {
                        player1Socket.emit("rematch_accepted", { newRoomId });
                        console.log(`[REMATCH DEBUG] Emitted rematch_accepted to Player 1: ${rematchMeta.player1SocketId}`);
                    }
                    if (player2Socket) {
                        player2Socket.emit("rematch_accepted", { newRoomId });
                        console.log(`[REMATCH DEBUG] Emitted rematch_accepted to Player 2: ${rematchMeta.player2SocketId}`);
                    }

                    // Replicate game startup logic
                    if (rematchMeta.gameType === GAME_TYPES.Survival) {
                        // 60s server timer
                        const timer = setTimeout(async () => {
                            const finishedGame = endSurvivalGame(newRoomId);
                            if (!finishedGame) return;

                            io.to(newRoomId).emit("game_over", {
                                winner: finishedGame.winner,
                                scores: Object.fromEntries(
                                    finishedGame.playerIds.map(id => [id, finishedGame.players[id].score])
                                )
                            });

                            try {
                                await persistTerminalGame(finishedGame);
                            } catch (err) {
                                console.error("Survival persistence failed:", err.message);
                            }
                            
                            await saveRematchMetadata(finishedGame);
                            survivalTimers.delete(newRoomId);
                        }, 60_000);

                        survivalTimers.set(newRoomId, timer);

                        io.to(newRoomId).emit("match_found", {
                            roomId: newRoomId,
                            players: [rematchMeta.player1Id, rematchMeta.player2Id],
                            state: newGame.state,
                            gameType: GAME_TYPES.Survival
                        });

                        if (player1Socket) {
                            player1Socket.emit("game_started", {
                                roomId: newRoomId,
                                question: newGame.currentQuestion.text,
                                opponentId: rematchMeta.player2Id,
                                myUserId: rematchMeta.player1Id,
                                state: newGame.state,
                                gameType: GAME_TYPES.Survival,
                                endsAt: newGame.endsAt
                            });
                        }

                        if (player2Socket) {
                            player2Socket.emit("game_started", {
                                roomId: newRoomId,
                                question: newGame.currentQuestion.text,
                                opponentId: rematchMeta.player1Id,
                                myUserId: rematchMeta.player2Id,
                                state: newGame.state,
                                gameType: GAME_TYPES.Survival,
                                endsAt: newGame.endsAt
                            });
                        }
                    } else {
                        // Blitz
                        const p1Question = getCurrentQuestion(newGame, rematchMeta.player1Id);
                        const p2Question = getCurrentQuestion(newGame, rematchMeta.player2Id);

                        io.to(newRoomId).emit("match_found", {
                            roomId: newRoomId,
                            players: [rematchMeta.player1Id, rematchMeta.player2Id],
                            state: newGame.state
                        });

                        if (player1Socket) {
                            player1Socket.emit("game_started", {
                                roomId: newRoomId,
                                question: p1Question.text,
                                opponentId: rematchMeta.player2Id,
                                myUserId: rematchMeta.player1Id,
                                state: newGame.state
                            });
                        }

                        if (player2Socket) {
                            player2Socket.emit("game_started", {
                                roomId: newRoomId,
                                question: p2Question.text,
                                opponentId: rematchMeta.player1Id,
                                myUserId: rematchMeta.player2Id,
                                state: newGame.state
                            });
                        }
                    }

                    // Clean up the Redis key immediately
                    await redis.del(`rematch:${roomId}`);
                    console.log(`[REMATCH DEBUG] Rematch accepted. New room created: ${newRoomId}`);
                }
            } else {
                // Declined: Notify the opponent
                const opponentSocketId = rematchMeta.player1Id === userId ? rematchMeta.player2SocketId : rematchMeta.player1SocketId;
                
                if (opponentSocketId) {
                    const opponentSocket = io.sockets.sockets.get(opponentSocketId);
                    if (opponentSocket) {
                        opponentSocket.emit("rematch_declined", { roomId });
                    }
                }

                // Clean up Redis key
                await redis.del(`rematch:${roomId}`);
                console.log(`[REMATCH DEBUG] Rematch declined for room: ${roomId}`);
            }
        } catch (err) {
            console.error("[REMATCH DEBUG] Failed to process rematch response:", err.message);
            socket.emit("rematch_error", "Internal rematch error.");
        }
    });

    // ── disconnect ────────────────────────────────────────────

    socket.on("disconnect", () => {
        removePlayer(socket.id);

        const session = getUserSession(userId);
        const roomId = session?.roomId;
        const game = roomId ? games.get(roomId) : null;

        if (game?.state === GAME_STATES.PLAYING) {
            pauseGame(roomId, userId);
            io.to(roomId).emit("game_paused", {
                roomId,
                disconnectedPlayerId: userId,
                reconnectWindowMs: ABORT_MS
            });
        }

        markUserReconnecting(userId, {
            onDisconnected: (nextSession) => {
                if (nextSession.roomId) {
                    io.to(nextSession.roomId).emit("user_state_changed", {
                        userId,
                        state: nextSession.state
                    });
                }
            },
            onAborted: async (nextSession) => {
                if (nextSession.roomId) {
                    const nextGame = games.get(nextSession.roomId);

                    if (
                        nextGame &&
                        nextGame.state !== GAME_STATES.COMPLETED &&
                        nextGame.state !== GAME_STATES.ABORTED
                    ) {
                        await persistAndEmitAbort(io, nextGame, userId);
                    }
                }

                removeUserSession(userId);
            }
        });
    });
}

module.exports = registerGameHandlers;