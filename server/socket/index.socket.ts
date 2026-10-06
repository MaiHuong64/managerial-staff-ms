import {Server} from "socket.io";
import type {Server as HTTPServer} from "http";
import {setupNotificationSocket} from "./nofication.socket";

let io: Server | null = null;

export const initSocket = (server: HTTPServer) => {
    io = new Server(server, {
        cors: {origin: "http://localhost:5173"}
    });
    setupNotificationSocket(io);
    return io; 
}
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
}