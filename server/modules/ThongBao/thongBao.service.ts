import * as repo from './thongBao.repository';
import {getIO} from '../../socket/index.socket';

export const notifyVienChuc = async (vcId: number, tieuDe: string, noiDung: string, loaiTb: string, data: object | null) => {
    const thongBao = await repo.create(vcId, tieuDe, noiDung, loaiTb, JSON.stringify(data));
    const room = `user:${vcId}`;

    getIO().to(room).emit("thong-bao", thongBao);
    
    return thongBao;
}
export const getThongBaoByVcId = async (vcId: number, {unReadOnly = false}) => {
    const [data, count] = await Promise.all([
        repo.findByVcId(vcId),
        repo.countByUSerId(vcId, {unReadOnly})
    ]);
    return {data, count};
}
export const markAsRead = repo.markAsRead;
export const markAllAsRead = repo.markAllAsRead;

