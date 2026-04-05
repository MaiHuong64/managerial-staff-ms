import pool from "../../config/db";
import { AddNhanSuDTO, CreatePhieuDeXuatDTO, UpdateTrangThaiPhieu } from "./phieuDeXuat.dto";
import { getAllPhieuDeXuat, getCode, getPhieuDeXuatById, insertChiTietPhieu, insertPhieuDeXuat, updateTrangThaiPhieu } from "./phieuDeXuat.repository";

export const createPhieuDeXuat = async (payload: CreatePhieuDeXuatDTO, user: any) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const maPhieu = await getCode(client);
        const phieu = await insertPhieuDeXuat(client, payload, user, maPhieu);
        await client.query("COMMIT");
        return phieu;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}
export const addNhanSu = async (phieuDeXuatId: number, payload: AddNhanSuDTO) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const chiTiet = await insertChiTietPhieu(client, phieuDeXuatId, payload);
        return chiTiet; 
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}
export const getList = async () => {
    return await getAllPhieuDeXuat();
};

export const getDetail = async (id: number) => {
    const rows = await getPhieuDeXuatById(id);
    if(!rows.length) throw new Error("Không tìm thấy thông tin phiếu")
    const { chi_tiet_id, ho_va_ten, vien_chuc_id, du_dieu_kien, ly_do_khong_du, ghi_chu_ct, ...phieu } = rows[0]
    return {
        ...phieu, nhanSu: rows.filter((r: any) => r.chi_tiet_id).map( (r:any) => ({
            id: r.chi_tiet_id,
            vien_chuc_id: r.vien_chuc_id,
            ho_va_ten: r.ho_va_ten,
            du_dieu_kien: r.du_dieu_kien,
            ly_do_khong_du: r.ly_do_khong_du,
            ghi_chu: r.ghi_chu_ct,
        }))
    }
}
export const approvePDX = async (id: number, user: any, payload: UpdateTrangThaiPhieu) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        if(user.vai_tro !== 'PTCCT')
            throw new Error("Không có quyền duyệt phiếu");
        const result = await updateTrangThaiPhieu(client, payload.trangThai, id, payload.ghiChu);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export const rejectPDX = async (id: number, user: any, payload: UpdateTrangThaiPhieu) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        if(user.vai_tro !== 'PTCCT')
            throw new Error("Không có quyền duyệt phiếu");
        const result = await updateTrangThaiPhieu(client, payload.trangThai, id, payload.ghiChu);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}