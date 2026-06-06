import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const checkRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const user = req.user;
        if (!user) 
            return res.status(401).json({ success: false, message: "Chưa xác thực" });
        
        if (!roles.includes(user?.vaiTro)) 
            return res.status(403).json({ success: false, message: "Không có quyền truy cập" });
        next();
    };
};