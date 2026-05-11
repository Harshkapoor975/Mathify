// // // function registerGameHandlers(
// // //     io,
// // //     socket
// // // ) {

// // //     socket.on("ping_test", () => {

// // //         console.log(
// // //             `Ping from ${socket.id}`
// // //         );

// // //         socket.emit("pong_test", {
// // //             message: "pong"
// // //         });
// // //     });
// // // }

// // // module.exports =
// // //     registerGameHandlers;
// // const {
// //     addPlayer,
// //     findMatch,
// //     removePlayer
// // } = require(
// //     "../matchmaking/matchmaking.service"
// // );

// // const {
// //     createGame
// // } = require("./game.engine");

// // function registerGameHandlers(
// //     io,
// //     socket
// // ) {

// //     socket.on(
// //         "find_match",
// //         () => {

// //             console.log(
// //                 `${socket.id} searching`
// //             );

// //             addPlayer({
// //                 socketId: socket.id
// //             });

// //             const match =
// //                 findMatch();

// //             if (!match) {
// //                 return;
// //             }

// //             const roomId =
// //                 `room_${Date.now()}`;

// //             const {
// //                 player1,
// //                 player2
// //             } = match;

// //             const player1Socket =
// //                 io.sockets.sockets.get(
// //                     player1.socketId
// //                 );

// //             const player2Socket =
// //                 io.sockets.sockets.get(
// //                     player2.socketId
// //                 );

// //             player1Socket.join(roomId);

// //             player2Socket.join(roomId);

// //             createGame(roomId);

// //             io.to(roomId).emit(
// //                 "match_found",
// //                 {
// //                     roomId
// //                 }
// //             );
// //         }
// //     );

// //     socket.on(
// //         "disconnect",
// //         () => {

// //             removePlayer(socket.id);
// //         }
// //     );
// // }

// // module.exports =
// //     registerGameHandlers;
// const {
//     addPlayer,
//     findMatch,
//     removePlayer
// } = require(
//     "../matchmaking/matchmaking.service"
// );

// const {
//     createGame
// } = require("./game.engine");

// function registerGameHandlers(
//     io,
//     socket
// ) {

//     socket.on(
//         "find_match",
//         () => {

//             console.log(
//                 "MATCH REQUEST:",
//                 socket.id
//             );

//             addPlayer({
//                 socketId: socket.id
//             });

//             const match =
//                 findMatch();

//             // no match yet
//             if (!match) {

//                 socket.emit(
//                     "waiting_for_player"
//                 );

//                 return;
//             }

//             const roomId =
//                 `room_${Date.now()}`;

//             console.log(
//                 "ROOM CREATED:",
//                 roomId
//             );

//             const {
//                 player1,
//                 player2
//             } = match;

//             const player1Socket =
//                 io.sockets.sockets.get(
//                     player1.socketId
//                 );

//             const player2Socket =
//                 io.sockets.sockets.get(
//                     player2.socketId
//                 );

//             // safety check
//             if (
//                 !player1Socket ||
//                 !player2Socket
//             ) {

//                 console.log(
//                     "Player socket missing"
//                 );

//                 return;
//             }

//             player1Socket.join(roomId);

//             player2Socket.join(roomId);

//             console.log(
//                 "PLAYERS JOINED ROOM"
//             );

//             createGame(roomId);

//             console.log(
//                 "GAME CREATED"
//             );

//             io.to(roomId).emit(
//                 "match_found",
//                 {
//                     roomId,

//                     players: [
//                         player1.socketId,
//                         player2.socketId
//                     ]
//                 }
//             );
//         }
//     );

//     socket.on(
//         "disconnect",
//         () => {

//             console.log(
//                 "DISCONNECTED:",
//                 socket.id
//             );

//             removePlayer(socket.id);
//         }
//     );
// }

// module.exports =
//     registerGameHandlers;
const {
    addPlayer,
    findMatch,
    removePlayer
} = require(
    "../matchmaking/matchmaking.service"
);

const {
    createGame,
    submitAnswer
} = require("./game.engine");

function registerGameHandlers(
    io,
    socket
) {

    socket.on(
        "find_match",
        () => {

            console.log(
                "MATCH REQUEST:",
                socket.id
            );

            addPlayer({
                socketId: socket.id
            });

            const match =
                findMatch();

            // no match yet
            if (!match) {

                socket.emit(
                    "waiting_for_player"
                );

                return;
            }

            const roomId =
                `room_${Date.now()}`;

            console.log(
                "ROOM CREATED:",
                roomId
            );

            const {
                player1,
                player2
            } = match;

            const player1Socket =
                io.sockets.sockets.get(
                    player1.socketId
                );

            const player2Socket =
                io.sockets.sockets.get(
                    player2.socketId
                );

            // safety check
            if (
                !player1Socket ||
                !player2Socket
            ) {

                console.log(
                    "Player socket missing"
                );

                return;
            }

            player1Socket.join(roomId);

            player2Socket.join(roomId);

            console.log(
                "PLAYERS JOINED ROOM"
            );

            const game =
                createGame(
                    roomId,
                    player1.socketId,
                    player2.socketId
                );

            console.log(
                "GAME CREATED"
            );

            // send first question
            player1Socket.emit(
                "game_started",
                {
                    roomId,

                    question:
                        game.questions[0].text
                }
            );

            player2Socket.emit(
                "game_started",
                {
                    roomId,

                    question:
                        game.questions[0].text
                }
            );

            io.to(roomId).emit(
                "match_found",
                {
                    roomId,

                    players: [
                        player1.socketId,
                        player2.socketId
                    ]
                }
            );
        }
    );

    socket.on(
        "submit_answer",
        (data) => {

            const {
                roomId,
                answer
            } = data;

            console.log(
                "ANSWER RECEIVED:",
                answer
            );

            const result =
                submitAnswer(
                    roomId,
                    socket.id,
                    answer
                );

            if (result.error) {

                socket.emit(
                    "game_error",
                    result.error
                );

                return;
            }

            socket.emit(
                "answer_result",
                result
            );

            io.to(roomId).emit(
                "progress_update",
                {
                    playerId:
                        socket.id,

                    progress:
                        result.progress
                }
            );

            if (result.winner) {

                io.to(roomId).emit(
                    "game_over",
                    {
                        winner:
                            result.winner
                    }
                );
            }
        }
    );

    socket.on(
        "disconnect",
        () => {

            console.log(
                "DISCONNECTED:",
                socket.id
            );

            removePlayer(socket.id);
        }
    );
}

module.exports =
    registerGameHandlers;