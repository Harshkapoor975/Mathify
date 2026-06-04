const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const registerGameHandlers =
    require("../modules/game/game.socket");

function setupSocket(server) {

    const io = new Server(server, {
        cors: {
            origin: "*"
        },
        transports: ["websocket", "polling"],
        allowEIO3: true
    });

    console.log("Socket setup initialized");

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;

        if (!token) {
            socket.user = {
                id: socket.id,
                isGuest: true
            };
            return next();
        }

        try {
            const decoded = jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET
            );

            socket.user = decoded;
            return next();
        } catch (err) {
            console.log("Socket auth failed:", err.message);
            return next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {

        console.log(
            `User connected: ${socket.id}`
        );
        console.log("Connection event fired");

        socket.on("ping", (data) => {
        console.log("Ping received:", data);

        socket.emit("pong", {
            success: true
        });
    });

        registerGameHandlers(io, socket);

        socket.on("disconnect", () => {

            console.log(
                `User disconnected: ${socket.id}`
            );
        });
    });
}

module.exports = setupSocket;
