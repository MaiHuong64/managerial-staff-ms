import { Request, Response } from "express";
import jwt  from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET;
interface AuthRequest extends Request {
    user?: any;
}
export const verifyToken = (req: AuthRequest, res: Response, next: Function) => {
    const header = req.headers['authorization'];
    // console.log("Headers:", header);
    const token = header && header.split(' ')[1];
    if(!token){
        return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }
    else{
         jwt.verify(token as string, secretKey as string, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Invalid token" });
        }
        req.user = user;
        next();
    });
    }
};
