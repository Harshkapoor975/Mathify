const { Server } = require("socket.io");

const registerGameHandlers =
    require("../modules/game/game.socket");

function setupSocket(server) {

    const io = new Server(server, {

        cors: {
            origin: "*"
        }
    });

    console.log("Socket setup initialized");

    io.on("connection", (socket) => {

        console.log(
            `User connected: ${socket.id}`
        );
        console.log("Connection event fired");

        registerGameHandlers(io, socket);

        socket.on("disconnect", () => {

            console.log(
                `User disconnected: ${socket.id}`
            );
        });
    });
}

module.exports = setupSocket;