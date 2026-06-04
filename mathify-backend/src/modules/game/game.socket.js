const {
    addPlayer,
    findMatch,
    removePlayer
} = require("../matchmaking/matchmaking.service");

const {
    GAME_STATES,
    createGame,
    submitAnswer,
    getCurrentQuestion,
    pauseGame,
    resumeGame,
    abortGame
} = require("./game.engine");
const games = require("./game.store");
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

function getSocketUserId(socket) {
    if (!socket.user || socket.user.isGuest) {
        return socket.id;
    }

    return socket.user._id?.toString() || socket.user.id?.toString() || socket.id;
}

function getOpponentId(game, userId) {
    return game.playerIds.find((playerId) => playerId !== userId) || null;
}

function getProgress(game) {
    return Object.fromEntries(
        game.playerIds.map((playerId) => [
            playerId,
            game.players[playerId]?.currentQuestionIndex ?? 0
        ])
    );
}

async function persistAndEmitAbort(io, game, abortedBy) {
    const abortedGame = abortGame(game.id, abortedBy);

    if (!abortedGame || abortedGame.state !== GAME_STATES.ABORTED) {
        return;
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

    io.to(game.id).emit("game_state_changed", {
        roomId: game.id,
        state: game.state,
        resumedBy: userId
    });
}

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

    socket.on("find_match", () => {
        console.log("MATCH REQUEST from userId:", userId);

        addPlayer({
            socketId: socket.id,
            userId
        });

        const match = findMatch();

        if (!match) {
            socket.emit("waiting_for_player");
            return;
        }

        const {
            player1,
            player2
        } = match;

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

        const game = createGame(
            roomId,
            player1.userId,
            player2.userId
        );

        const player1Question = getCurrentQuestion(game, player1.userId);
        const player2Question = getCurrentQuestion(game, player2.userId);

        io.to(roomId).emit("match_found", {
            roomId,
            players: [
                player1.userId,
                player2.userId
            ],
            state: game.state
        });

        player1Socket.emit("game_started", {
            roomId,
            question: player1Question.text,
            opponentId: player2.userId,
            myUserId: player1.userId,
            state: game.state
        });

        player2Socket.emit("game_started", {
            roomId,
            question: player2Question.text,
            opponentId: player1.userId,
            myUserId: player2.userId,
            state: game.state
        });

        console.log("GAME STARTED:", roomId, player1.userId, "vs", player2.userId);
    });

    socket.on("submit_answer", async (data) => {
        const {
            roomId,
            answer
        } = data;

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
            const game = games.get(roomId);

            io.to(roomId).emit("game_over", {
                winner: result.winner
            });

            try {
                await persistTerminalGame(game);
            } catch (err) {
                console.error("Match completion persistence failed:", err.message);
            }
        }
    });

    socket.on("abort_game", async ({ roomId } = {}) => {
        const game = roomId ? games.get(roomId) : null;

        if (!game) {
            socket.emit("game_error", "Game not found");
            return;
        }

        await persistAndEmitAbort(io, game, userId);
    });

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
