import { Request, Response } from "express";
import { AuthService } from "./auth.service";

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { tenDangNhap, matKhau, vaiTro } = req.body;

        const user = await AuthService.register(tenDangNhap, matKhau, vaiTro );
        return res.status(201).json({ success: true, data: user });
    } catch (err: any) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { tenDangNhap, matKhau } = req.body;

        const data = await AuthService.login(
            tenDangNhap,
            matKhau
        );

        return res.json({ success: true, message: "Login successful", data });
    } catch (err: any) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

export const logoutUser = (req: Request, res: Response) => {
    return res.json({ success: true, message: "User logged out successfully" });
};