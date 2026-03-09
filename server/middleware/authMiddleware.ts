import { Request, Response } from "express";
import { Jwt } from "jsonwebtoken";
import { verify } from "node:crypto";

const secretKey = process.env.JWT_SECRET;
const tokenExpiry = process.env.JWT_EXPIRY;

export const verifyToken = async (req: Request, res: Response, next: Function) => {
    const header = await req.headers['authorization'];
    const token = header && header.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: "Access denied" });
    try{

    }
    catch(error){
        console.error("Error verifying token:", error);
        res.status(400).json({ success: false, message: "Invalid token" });
    }
};
