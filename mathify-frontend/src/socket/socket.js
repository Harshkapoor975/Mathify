import { io } from "socket.io-client";

let socket = null;

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL ||
    "http://localhost:3000";

function getSocketOptions() {
    const token = localStorage.getItem("token");

    const options = {
        autoConnect: true,
        transports: ["websocket", "polling"],
        reconnectionDelay: 1000,
        reconnection: true,
        reconnectionAttempts: 5
    };

    if (token) {
        options.auth = { token };
    }

    return options;
}

export function getSocket() {
    if (!socket) {
        socket = io(SOCKET_URL, getSocketOptions());
    }

    return socket;
}

export function resetSocket(){
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export default getSocket;
