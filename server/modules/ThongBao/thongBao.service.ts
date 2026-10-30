import * as repo from './thongBao.repository';
import {getIO} from '../../socket/index.socket';

export const createThongBao = async (vcIds: number[], tieuDe: string, noiDung: string, loaiTb: string, data: object | null) => {
    const result = await Promise.all(vcIds.map(vcId => repo.create(vcId, tieuDe, noiDung, loaiTb, JSON.stringify(data))));
    // return result

    const io = getIO();
    result.forEach((tb, idx) => {io.to(`user:${vcIds[idx]}`).emit("thong-bao", tb)})
    return result;
}
export const getThongBaoByVcId = async (vcId: number) => {
    const result = await repo.findByVcId(vcId);
    return result;
}
export const countUnread = repo.countUnread;
export const markAsRead = repo.markAsRead;
export const markAllAsRead = repo.markAllAsRead;

