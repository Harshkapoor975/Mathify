// const waitingPlayers =
//     require("./queue.store");

// function addPlayer(player) {

//     waitingPlayers.push(player);
// }

// function removePlayer(socketId) {

//     const index =
//         waitingPlayers.findIndex(
//             (player) =>
//                 player.socketId === socketId
//         );

//     if (index !== -1) {

//         waitingPlayers.splice(index, 1);
//     }
// }

// function findMatch() {

//     if (waitingPlayers.length < 2) {
//         return null;
//     }

//     const player1 =
//         waitingPlayers.shift();

//     const player2 =
//         waitingPlayers.shift();

//     return {
//         player1,
//         player2
//     };
// }

// module.exports = {

//     addPlayer,

//     removePlayer,

//     findMatch
// };
const waitingPlayers =
    require("./queue.store");

function addPlayer(player) {

    const alreadyExists =
        waitingPlayers.find(
            (p) =>
                p.socketId === player.socketId
        );

    if (alreadyExists) {

        console.log(
            "Player already in queue"
        );

        return;
    }

    waitingPlayers.push(player);

    console.log(
        "PLAYER ADDED:",
        player.socketId
    );

    console.log(
        "CURRENT QUEUE:",
        waitingPlayers.map(
            (p) => p.socketId
        )
    );
}

function removePlayer(socketId) {

    const index =
        waitingPlayers.findIndex(
            (player) =>
                player.socketId === socketId
        );

    if (index !== -1) {

        waitingPlayers.splice(index, 1);

        console.log(
            "PLAYER REMOVED:",
            socketId
        );
    }

    console.log(
        "QUEUE AFTER REMOVE:",
        waitingPlayers.map(
            (p) => p.socketId
        )
    );
}

function findMatch() {

    console.log(
        "TRYING TO FIND MATCH"
    );

    console.log(
        "QUEUE SIZE:",
        waitingPlayers.length
    );

    if (waitingPlayers.length < 2) {

        console.log(
            "NOT ENOUGH PLAYERS"
        );

        return null;
    }

    const player1 =
        waitingPlayers.shift();

    const player2 =
        waitingPlayers.shift();

    console.log(
        "MATCH FOUND:",
        player1.socketId,
        player2.socketId
    );

    return {
        player1,
        player2
    };
}

module.exports = {

    addPlayer,

    removePlayer,

    findMatch
};