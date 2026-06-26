
// const {blitzWaitingPlayers, survivalWaitingPlayers} =
//     require("./queue.store");

// function addPlayer(player) {

//     const alreadyExists =
//         blitzWaitingPlayers.find(
//             (p) =>
//                 p.socketId === player.socketId
//         );

//     if (alreadyExists) {

//         console.log(
//             "Player already in queue"
//         );

//         return;
//     }

//     blitzWaitingPlayers.push(player);

//     console.log(
//         "PLAYER ADDED:",
//         player.socketId
//     );

//     console.log(
//         "CURRENT QUEUE:",
//         blitzWaitingPlayers.map(
//             (p) => p.socketId
//         )
//     );
// }

// function removePlayer(socketId) {

//     const index =
//         blitzWaitingPlayers.findIndex(
//             (player) =>
//                 player.socketId === socketId
//         );

//     if (index !== -1) {

//         blitzWaitingPlayers.splice(index, 1);

//         console.log(
//             "PLAYER REMOVED:",
//             socketId
//         );
//     }

//     console.log(
//         "QUEUE AFTER REMOVE:",
//         blitzWaitingPlayers.map(
//             (p) => p.socketId
//         )
//     );
// }

// // function findMatch() {

// //     console.log(
// //         "TRYING TO FIND MATCH"
// //     );

// //     console.log(
// //         "QUEUE SIZE:",
// //         blitzWaitingPlayers.length
// //     );

// //     if (blitzWaiting Players.length < 2) {

// //         console.log(
// //             "NOT ENOUGH PLAYERS"
// //         );

// //         return null;
// //     }

// //     const player1 =
// //         blitzWaitingPlayers.shift();

// //     const player2 =
// //         blitzWaitingPlayers.shift();

// //     console.log(
// //         "MATCH FOUND:",
// //         player1.socketId,
// //         player2.socketId
// //     );

// //     return {
// //         player1,
// //         player2
// //     };
// // }
// function findMatch() {
//     if (blitzWaitingPlayers.length < 2) return null;
//     const player1 = blitzWaitingPlayers[0];
//     const opponentIndex = blitzWaitingPlayers.findIndex(
//         (p, i) => i !== 0 && p.userId !== player1.userId
//     );
//     if (opponentIndex === -1) return null;
//     blitzWaitingPlayers.splice(0, 1);
//     const player2 = blitzWaitingPlayers.splice(opponentIndex - 1, 1)[0];
//     return { player1, player2 };
// }

// function findSurvivalMatch() {
//     if (survivalWaitingPlayers.length < 2) return null;
//     const player1 = survivalWaitingPlayers[0];
//     const opponentIndex = survivalWaitingPlayers.findIndex(
//         (p, i) => i !== 0 && p.userId !== player1.userId
//     );
//     if (opponentIndex === -1) return null;
//     survivalWaitingPlayers.splice(0, 1);
//     const player2 = survivalWaitingPlayers.splice(opponentIndex - 1, 1)[0];
//     return { player1, player2 };
// }
// module.exports = {

//     addPlayer,

//     removePlayer,

//     findMatch,

//     findSurvivalMatch
// };

const {blitzWaitingPlayers, survivalWaitingPlayers} =
    require("./queue.store");

function addPlayer(player, gameType = "Blitz") {
    const queue = gameType === "Survival" ? survivalWaitingPlayers : blitzWaitingPlayers;
    const alreadyExists = queue.find(
        (p) => p.socketId === player.socketId
    );

    if (alreadyExists) {
        console.log(
            "Player already in queue:", gameType
        );
        return;
    }

    queue.push(player);

    console.log(
        "PLAYER ADDED TO", gameType, ":",
        player.socketId
    );
}

function removePlayer(socketId) {
    const bIndex = blitzWaitingPlayers.findIndex(
        (player) => player.socketId === socketId
    );
    if (bIndex !== -1) {
        blitzWaitingPlayers.splice(bIndex, 1);
        console.log(
            "PLAYER REMOVED FROM BLITZ:",
            socketId
        );
    }

    const sIndex = survivalWaitingPlayers.findIndex(
        (player) => player.socketId === socketId
    );
    if (sIndex !== -1) {
        survivalWaitingPlayers.splice(sIndex, 1);
        console.log(
            "PLAYER REMOVED FROM SURVIVAL:",
            socketId
        );
    }
}

// function findMatch() {

//     console.log(
//         "TRYING TO FIND MATCH"
//     );

//     console.log(
//         "QUEUE SIZE:",
//         blitzWaitingPlayers.length
//     );

//     if (blitzWaiting Players.length < 2) {

//         console.log(
//             "NOT ENOUGH PLAYERS"
//         );

//         return null;
//     }

//     const player1 =
//         blitzWaitingPlayers.shift();

//     const player2 =
//         blitzWaitingPlayers.shift();

//     console.log(
//         "MATCH FOUND:",
//         player1.socketId,
//         player2.socketId
//     );

//     return {
//         player1,
//         player2
//     };
// }
function findMatch() {
    if (blitzWaitingPlayers.length < 2) return null;
    const player1 = blitzWaitingPlayers[0];
    const opponentIndex = blitzWaitingPlayers.findIndex(
        (p, i) => i !== 0 && p.userId !== player1.userId
    );
    if (opponentIndex === -1) return null;
    blitzWaitingPlayers.splice(0, 1);
    const player2 = blitzWaitingPlayers.splice(opponentIndex - 1, 1)[0];
    return { player1, player2 };
}

function findSurvivalMatch() {
    if (survivalWaitingPlayers.length < 2) return null;
    const player1 = survivalWaitingPlayers[0];
    const opponentIndex = survivalWaitingPlayers.findIndex(
        (p, i) => i !== 0 && p.userId !== player1.userId
    );
    if (opponentIndex === -1) return null;
    survivalWaitingPlayers.splice(0, 1);
    const player2 = survivalWaitingPlayers.splice(opponentIndex - 1, 1)[0];
    return { player1, player2 };
}
module.exports = {

    addPlayer,

    removePlayer,

    findMatch,

    findSurvivalMatch
};