// const {
//     addPlayer,
//     findMatch,
//     removePlayer
// } = require("../matchmaking/matchmaking.service");

// const {
//     createGame,
//     submitAnswer,
//     getCurrentQuestion
// } = require("./game.engine");

// function registerGameHandlers(io, socket) {
//     socket.on("find_match", () => {
//         console.log("MATCH REQUEST:", socket.id);

//         addPlayer({ socketId: socket.id });

//         const match = findMatch();

//         if (!match) {
//             socket.emit("waiting_for_player");
//             return;
//         }

//         const { player1, player2 } = match;
//         const player1Socket = io.sockets.sockets.get(player1.socketId);
//         const player2Socket = io.sockets.sockets.get(player2.socketId);

//         if (!player1Socket || !player2Socket) {
//             console.log("A player socket went missing; re-queuing survivor");

//             if (player1Socket) addPlayer(player1);
//             if (player2Socket) addPlayer(player2);

//             socket.emit("waiting_for_player");
//             return;
//         }

//         const roomId = `room_${Date.now()}`;
//         console.log("ROOM CREATED:", roomId);

//         player1Socket.join(roomId);
//         player2Socket.join(roomId);

//         const game = createGame(
//             roomId,
//             player1.socketId,
//             player2.socketId
//         );

//         const p1Question = getCurrentQuestion(game, player1.socketId);
//         const p2Question = getCurrentQuestion(game, player2.socketId);

//         io.to(roomId).emit("match_found", {
//             roomId,
//             players: [
//                 player1.socketId,
//                 player2.socketId
//             ]
//         });

//         player1Socket.emit("game_started", {
//             roomId,
//             question: p1Question.text,
//             opponentId: player2.socketId
//         });

//         player2Socket.emit("game_started", {
//             roomId,
//             question: p2Question.text,
//             opponentId: player1.socketId
//         });

//         console.log("GAME STARTED:", roomId);
//     });

//     socket.on("submit_answer", (data) => {
//         const {
//             roomId,
//             answer
//         } = data;

//         console.log("ANSWER RECEIVED:", answer, "from:", socket.id);

//         const result = submitAnswer(roomId, socket.id, answer);

//         if (result.error) {
//             socket.emit("game_error", result.error);
//             return;
//         }

//         socket.emit("answer_result", result);

//         io.to(roomId).emit("progress_update", {
//             playerId: socket.id,
//             progress: result.progress
//         });

//         if (result.winner) {
//             io.to(roomId).emit("game_over", {
//                 winner: result.winner
//             });
//         }
//     });

//     socket.on("disconnect", () => {
//         console.log("DISCONNECTED:", socket.id);
//         removePlayer(socket.id);
//     });
// }

// module.exports = registerGameHandlers;
const { addPlayer, findMatch, removePlayer } = require("../matchmaking/matchmaking.service");
const { createGame, submitAnswer, getCurrentQuestion } = require("./game.engine");
const { updateRatings } = require("../user/rating.service");

function registerGameHandlers(io, socket) {
    // Stable identity: MongoDB _id for auth users, socket.id for guests
    const userId = socket.user?.isGuest ? socket.id : socket.user.id.toString();

    socket.on("find_match", () => {
        console.log("MATCH REQUEST from userId:", userId);

        // Store BOTH socketId (for routing) and userId (for game logic)
        addPlayer({ socketId: socket.id, userId });

        const match = findMatch();
        if (!match) { socket.emit("waiting_for_player"); return; }

        const { player1, player2 } = match;
        const p1Socket = io.sockets.sockets.get(player1.socketId);
        const p2Socket = io.sockets.sockets.get(player2.socketId);

        if (!p1Socket || !p2Socket) {
            if (p1Socket) addPlayer(player1);
            if (p2Socket) addPlayer(player2);
            socket.emit("waiting_for_player");
            return;
        }

        const roomId = `room_${Date.now()}`;
        p1Socket.join(roomId);
        p2Socket.join(roomId);

        // Game engine keyed by userId, not socketId
        const game = createGame(roomId, player1.userId, player2.userId);

        p1Socket.emit("game_started", {
            roomId,
            question: getCurrentQuestion(game, player1.userId).text,
            opponentId: player2.userId,
            myUserId: player1.userId,
        });

        p2Socket.emit("game_started", {
            roomId,
            question: getCurrentQuestion(game, player2.userId).text,
            opponentId: player1.userId,
            myUserId: player2.userId,
        });

        console.log("GAME STARTED:", roomId, player1.userId, "vs", player2.userId);
    });

    socket.on("submit_answer", async (data) => {
        const { roomId, answer } = data;
        const result = submitAnswer(roomId, userId, answer);

        if (result.error) { socket.emit("game_error", result.error); return; }

        socket.emit("answer_result", result);

        io.to(roomId).emit("progress_update", { playerId: userId, progress: result.progress });

        if (result.winner) {
            io.to(roomId).emit("game_over", { winner: result.winner });

            // Update ratings only for real (non-guest) users
            const games = require("./game.store");
            const game = games.get(roomId);
            if (game && !socket.user?.isGuest) {
                const loserId = game.playerIds.find(id => id !== result.winner);
                if (loserId) {
                    const deltas = await updateRatings(result.winner, loserId);
                    console.log("Ratings updated:", deltas);
                }
            }
        }
    });

    socket.on("disconnect", () => {
        removePlayer(socket.id);  // queue still uses socketId for lookup
    });
}

module.exports = registerGameHandlers;