import {io} from "socket.io-client";

export const socket = io("http://localhost:3000", {
    transports: ["websocket"],
    autoConnect: false,
});

export const connectSocket = (token: string) => {
    if(socket.connected) socket.disconnect();
    socket.auth = { token };
    socket.connect();
}

export const disconnectSocket = () => {
    socket.disconnect();
}

socket.on("connect_err", (err) => {console.error("Socket connection error:", err.message)});