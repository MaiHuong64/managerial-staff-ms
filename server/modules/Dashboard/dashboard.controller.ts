import { Request, Response } from "express";
import { getBGHDashboardData, getPTCCTDashboardData } from "./dashboard.service";

export const getBGHDashboardController = async (req: Request, res: Response) => {
    try {
        const data = await getBGHDashboardData();
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message || "Lấy dữ liệu dashboard thất bại" });
    }
};

export const getPTCCTDashboardController = async (req: Request, res: Response) => {
    try {
        const data = await getPTCCTDashboardData();
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message || "Lấy dữ liệu dashboard thất bại" });
    }
};
