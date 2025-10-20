// src/socket.js
import { io } from "socket.io-client";

let socket;

export const connectSocket = (userId) => {
    if (!socket) {
        socket = io("http://localhost:3000", { withCredentials: true });
        socket.on("connect", () => {
            console.log("Connected to socket:", socket.id);
            // register the user on the server
            socket.emit("register", userId);
        });
    }
    return socket;
};

export const getSocket = () => socket;
