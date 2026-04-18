import pool from "../../config/db";
import { CreatePhieuDeXuatDTO, UpdateDuDieuKienDTO, UpdateTrangThaiPhieu } from "./phieuDeXuat.dto";
import { getAllPhieuDeXuat, getCode, getPhieuDeXuatById, insertChiTietPhieu, insertPhieuDeXuat, submitPhieuDeXuat, updateTrangThaiPhieu, insertVaoChiTietQuyHoach, updateDuDieuKien, getPhieuIdByChiTietId, updateTrangThaiPhieuDuDieuKien } from "./phieuDeXuat.repository";

export const createPhieuDeXuat = async (payload: CreatePhieuDeXuatDTO, user: any) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const maPhieu = await getCode(client);
        const phieu = await insertPhieuDeXuat(client, payload, user, maPhieu);

        for(const vc of payload.vienChucList){
            await insertChiTietPhieu(client, phieu.id, vc)
        }
        await client.query("COMMIT");
        return phieu;
    } catch (err) {
        console.error("Lỗi tạo phiếu:", err);
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
    const { chiTietId, hoVaTen, vienChucId, duDieuKien, lyDoKhongDu, ghiChu, ...phieu } = rows[0];
    return {
        ...phieu, nhanSu: rows.filter((r: any) => r.chiTietId).map( (r:any) => ({
            id: r.chiTietId,
            vienChucId: r.vienChucId,
            hoVaTen: r.hoVaTen,
            duDieuKien: r.duDieuKien,
            lyDoKhongDu: r.lyDoKhongDu,
            ghiChu: r.ghiChuCt,
        }))
    }
}
export const submitPDX = async (id: number, user: any) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        if (user.vaiTro !== 'VCQL')
            throw new Error("Không có quyền gửi phiếu");
        const result = await submitPhieuDeXuat(client, id);
        if (!result) throw new Error("Phiếu không tồn tại hoặc đã được gửi");
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

// Duyệt các ứng viên trong phiếu đề xuất chủ
export const CheckCandidateCondition = async (chiTietId: number, user: any, payload: UpdateDuDieuKienDTO) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        if (user.vaiTro !== 'PTCCT') {
            throw new Error("Không có quyền đối soát hồ sơ");
        }
        const result = await updateDuDieuKien(client, chiTietId, payload);
        // const phieuId = await getPhieuIdByChiTietId(client, chiTietId);
        // if (phieuId) {
        //     await updateTrangThaiPhieuDuDieuKien(client, phieuId);
        // }
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export const approvePDX = async (id: number, user: any, payload: UpdateTrangThaiPhieu) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        if (user.vaiTro !== 'PTCCT')
            throw new Error("Không có quyền duyệt phiếu");
        if (!payload.dotQuyHoachId)
            throw new Error("Vui lòng chọn đợt quy hoạch");

        const result = await updateTrangThaiPhieu(client, payload.trangThai, id, payload.ghiChu);
        await insertVaoChiTietQuyHoach(client, id, payload.dotQuyHoachId);

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
        if(user.vaiTro !== 'PTCCT')
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