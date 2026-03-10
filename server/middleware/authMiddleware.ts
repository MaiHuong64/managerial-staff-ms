import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET;
interface AuthRequest extends Request {
    user?:{id: number, ten_dang_nhap: string, vai_tro: string}
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    // console.log("Headers:", header);
    const token = header?.split(" ")[1];
    if(!token){
        return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }
    try {
        const decode = jwt.verify(token, secretKey as string) as AuthRequest["user"]
        req.user = decode;
        next();
    } catch (error) {
        return res.status(403).json({
            sucess: false,
            message: "Invalid token"
        })
    }
};
