import { io } from "socket.io-client";

let socket = null;

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL ||
    "http://localhost:3000";

function getSocketOptions() {
    const token = localStorage.getItem("token");

    if (!token) {
        return {
            autoConnect: true
        };
    }

    return {
        autoConnect: true,
        auth: {
            token
        }
    };
}

export function getSocket() {
    if (!socket) {
        socket = io(SOCKET_URL, getSocketOptions());
    }

    return socket;
}

export default getSocket;
