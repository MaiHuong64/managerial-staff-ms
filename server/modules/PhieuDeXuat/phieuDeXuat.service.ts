import pool from "../../config/db";
import * as PhieuDeXuatDTO  from "./phieuDeXuat.dto";
import * as PhieuDeXuatRepo from "./phieuDeXuat.repository";

export const createPhieuDeXuat = async (payload: PhieuDeXuatDTO.CreatePhieuDeXuatDTO, user: any) => {
    const client = await pool.connect();
    //  console.log('payload nhận được:', JSON.stringify(payload, null, 2));
    try {
        if(payload.vienChucList.length > 3)
            throw new Error(`Chức danh này chỉ được đề xuất tối đa 3 ứng viên, hiện đề xuất ${payload.vienChucList.length}`);

        const maPhieu = await PhieuDeXuatRepo.generatePhieuDeXuatCode(client);
        const phieu = await PhieuDeXuatRepo.insertPhieuDeXuat(client, payload, user, maPhieu);

       
        for(const vc of payload.vienChucList){
            await PhieuDeXuatRepo.insertChiTietPhieu(client, phieu.id, vc)
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
    return await PhieuDeXuatRepo.getAllPhieuDeXuat();
};

export const getDetail = async (id: number) => {
    const rows = await PhieuDeXuatRepo.getPhieuDeXuatById(id);
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
        const result = await PhieuDeXuatRepo.submitPhieuDeXuat(client, id);
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
export const CheckCandidateCondition = async (chiTietId: number, user: any, payload: PhieuDeXuatDTO.UpdateDuDieuKienDTO) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        if (user.vaiTro !== 'PTCCT') {
            throw new Error("Không có quyền đối soát hồ sơ");
        }
        const result = await PhieuDeXuatRepo.updateDuDieuKien(client, chiTietId, payload);
       
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export const approvePDX = async (id: number, user: any, payload: PhieuDeXuatDTO.UpdateTrangThaiPhieu) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        if (user.vaiTro !== 'PTCCT')
            throw new Error("Không có quyền duyệt phiếu");
        if (!payload.dotQuyHoachId)
            throw new Error("Vui lòng chọn đợt quy hoạch");

        // Check đã xét hết từng viên chức chưa
        const allReviewed = await PhieuDeXuatRepo.checkAllCandidatesReviewed(client, id);
        if (!allReviewed) {
            throw new Error("Phải xét duyệt hết từng viên chức trước khi phê duyệt phiếu");
        }

        // Check có ít nhất 1 người đủ điều kiện
        const eligibleCount = await PhieuDeXuatRepo.countEligibleCandidates(client, id);
        if (eligibleCount === 0) {
            throw new Error("Không có viên chức nào đủ điều kiện để thêm vào quy hoạch");
        }

        const result = await PhieuDeXuatRepo.updateTrangThaiPhieu(client, payload.trangThai, id, payload.ghiChu);
        await PhieuDeXuatRepo.insertVaoChiTietQuyHoach(client, id, payload.dotQuyHoachId);

        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export const rejectPDX = async (id: number, user: any, payload: PhieuDeXuatDTO.UpdateTrangThaiPhieu) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        if(user.vaiTro !== 'PTCCT')
            throw new Error("Không có quyền duyệt phiếu");
        const result = await PhieuDeXuatRepo.updateTrangThaiPhieu(client, payload.trangThai, id, payload.ghiChu);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}