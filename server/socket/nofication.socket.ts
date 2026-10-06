import { Server } from "socket.io";
import {verifyJWT} from "../middleware/auth.middleware"; 

export const setupNotificationSocket = (io: Server) => {
    io.use((socket: any, next: any) =>{
        try{
            const token = socket.handshake.auth.token;
            if(!token) throw new Error("No token provided");
            const user = verifyJWT(token);
            socket.data.user = user;
            next();
        }
        catch(err){
            next(new Error("Authentication error"));
        }
    });
    io.on("connection", (socket) => {
        const user = socket.data.user;
        console.log(`User connected: ${user.hoVaTen}`);
        socket.join(`user:${user.vienChucId}`);  
    });
}