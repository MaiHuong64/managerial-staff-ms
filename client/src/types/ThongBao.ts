export interface ThongBao {
    id: number;
    tieuDe: string;
    noiDung: string;
    loaiTb: "THONG_TIN" | "CAN_XU_LY";
    data: {ob: string, obId: number} | null;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}