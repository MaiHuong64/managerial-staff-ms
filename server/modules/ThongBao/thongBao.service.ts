import * as repo from './thongBao.repository';
import {getIO} from '../../socket/index.socket';

type obType = "dot_quy_hoach" | "phieu_de_xuat_nhan_su_quy_hoach" | "ho_so_quy_hoach";

export const createThongBao = async (vcIds: number[], tieuDe: string, noiDung: string, loaiTb: string, obType: obType, obId: number) => {
    return Promise.all(vcIds.map(vcId => repo.insertThongBao(vcId, tieuDe, noiDung, loaiTb, {obType, obId})))
}

export const sendThongBao = async (vcIds: number[], tieuDe: string, noiDung: string, loaiTb: string, obType: obType, obId: number) => {
    const result = await createThongBao(vcIds, tieuDe, noiDung, loaiTb, obType, obId);
    const io = getIO();
    result.forEach((tb, i) => io.to(`user:${vcIds[i]}`).emit("thong-bao", tb));
}

export const sendPhieuDeXuat = async (vcIds: number[], phieuId: number, tenDonVi: string) => {
    sendThongBao(vcIds, `Phiếu đề xuất nhân sự`, `Đơn vị vừa gửi phiếu đề xuất nhân sự ${tenDonVi}`, "CAN_XU_LY", "phieu_de_xuat_nhan_su_quy_hoach", phieuId);
}

export const sendDotQuyHoach = async (vcIds: number[], dotId: number, tenDot: string) => {
    sendThongBao(vcIds, `Đợt quy hoạch`, `Đơn vị vừa gửi đợt quy hoạch ${tenDot}`, "THONG_BAO", "dot_quy_hoach", dotId);
}   
export const getThongBaoByVcId = (vcId: number, loaiTb?: string) => {
    return repo.findByVcId(vcId, loaiTb);
}

export const countUnread = repo.countUnread;
export const markAsRead = repo.markAsRead;
export const markAllAsRead = repo.markAllAsRead;

