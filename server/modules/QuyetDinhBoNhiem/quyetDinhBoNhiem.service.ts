import pool from "../../config/db";
import { mapArrayToCamel } from "../../utils/mapper";
import { CreateQDBoNhiemDTO } from "./quyetDinhBoNhiem.dto";
import * as QDBoNhiemRepo from "./quyetDinhBoNhiem.repository";

export const CreateQDBN = async (payload: CreateQDBoNhiemDTO, hoSoId: number) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const maBN = await QDBoNhiemRepo.generateQDBNCode(client);
        const quyetDinh = await QDBoNhiemRepo.insertQuyetDinhBoNhiem(client, maBN, payload, hoSoId);
        const {vienChucId, chucDanhId, gioiTinh, ngaySinh, thoiHan} = await QDBoNhiemRepo.getThongTinNhiemKyByHoSoId(client, hoSoId);

        // Đóng nhiệm kỳ cũ 
        const ngayKetThucCu = new Date(payload.ngayCoHieuLuc);
        ngayKetThucCu.setDate(ngayKetThucCu.getDate() - 1);
        await QDBoNhiemRepo.insertNhiemKyChucVu(client, ngayKetThucCu, "Bổ nhiệm chức danh mới", vienChucId);

            // Tạo nhiệm kỳ mới
        await QDBoNhiemRepo.updateNhiemKyChucVu(client, vienChucId, chucDanhId, payload.ngayCoHieuLuc, thoiHan, ngaySinh, gioiTinh, quyetDinh.id);

        // Cập nhật trạng thái hồ sơ
        await QDBoNhiemRepo.updateTrangThaiHoSoBoNhiem(client, hoSoId);

        await client.query("COMMIT");
        return quyetDinh;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export const getQDBoNhiemById = async (id: number) => {
    const result = await QDBoNhiemRepo.getQuyetDinhBoNhiemDetailById(id);
    return mapArrayToCamel(result);
}

export const getHoSoInfo = async (hoSoId: number) => {
    const result = await QDBoNhiemRepo.getThongTinHoSoChoQuyetDinh(hoSoId);
    return result;
}