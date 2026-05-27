const {
    addPlayer,
    findMatch,
    removePlayer
} = require("../matchmaking/matchmaking.service");

const {
    createGame,
    submitAnswer,
    getCurrentQuestion
} = require("./game.engine");

function registerGameHandlers(io, socket) {
    socket.on("find_match", () => {
        console.log("MATCH REQUEST:", socket.id);

        addPlayer({ socketId: socket.id });

        const match = findMatch();

        if (!match) {
            socket.emit("waiting_for_player");
            return;
        }

        const { player1, player2 } = match;
        const player1Socket = io.sockets.sockets.get(player1.socketId);
        const player2Socket = io.sockets.sockets.get(player2.socketId);

        if (!player1Socket || !player2Socket) {
            console.log("A player socket went missing; re-queuing survivor");

            if (player1Socket) addPlayer(player1);
            if (player2Socket) addPlayer(player2);

            socket.emit("waiting_for_player");
            return;
        }

        const roomId = `room_${Date.now()}`;
        console.log("ROOM CREATED:", roomId);

        player1Socket.join(roomId);
        player2Socket.join(roomId);

        const game = createGame(
            roomId,
            player1.socketId,
            player2.socketId
        );

        const p1Question = getCurrentQuestion(game, player1.socketId);
        const p2Question = getCurrentQuestion(game, player2.socketId);

        io.to(roomId).emit("match_found", {
            roomId,
            players: [
                player1.socketId,
                player2.socketId
            ]
        });

        player1Socket.emit("game_started", {
            roomId,
            question: p1Question.text,
            opponentId: player2.socketId
        });

        player2Socket.emit("game_started", {
            roomId,
            question: p2Question.text,
            opponentId: player1.socketId
        });

        console.log("GAME STARTED:", roomId);
    });

    socket.on("submit_answer", (data) => {
        const {
            roomId,
            answer
        } = data;

        console.log("ANSWER RECEIVED:", answer, "from:", socket.id);

        const result = submitAnswer(roomId, socket.id, answer);

        if (result.error) {
            socket.emit("game_error", result.error);
            return;
        }

        socket.emit("answer_result", result);

        io.to(roomId).emit("progress_update", {
            playerId: socket.id,
            progress: result.progress
        });

        if (result.winner) {
            io.to(roomId).emit("game_over", {
                winner: result.winner
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("DISCONNECTED:", socket.id);
        removePlayer(socket.id);
    });
}

module.exports = registerGameHandlers;
