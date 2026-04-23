import pool from "../../config/db";
import { mapArrayToCamel } from "../../utils/mapper";
import { CreateQDBoNhiemDTO } from "./quyetDinhBoNhiem.dto";
import { generateQDBNCode, getDetail, getInforFromHS, handleNhiemKy, insertNhiemKy, insertQuyetDinh, updateHoSoStatus } from "./quyetDinhBoNhiem.repository";

export const CreateQDBN = async (payload: CreateQDBoNhiemDTO, hoSoId: number) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const maBN = await generateQDBNCode(client);
        const quyetDinh = await insertQuyetDinh(client, maBN, payload, hoSoId);
        const {vienChucId, chucDanhId} = await getInforFromHS(client, hoSoId);

        // Đóng nhiệm kỳ cũ (nếu có)
        const ngayKetThucCu = new Date(payload.ngayCoHieuLuc);
        ngayKetThucCu.setDate(ngayKetThucCu.getDate() - 1);
        await handleNhiemKy(client, ngayKetThucCu, "Bổ nhiệm chức danh mới", vienChucId);

        // Tạo nhiệm kỳ mới
        await insertNhiemKy(client, vienChucId, chucDanhId, payload.ngayCoHieuLuc, quyetDinh.id);

        // Cập nhật trạng thái hồ sơ
        await updateHoSoStatus(client, hoSoId);

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
    const result = await getDetail(id);
    return mapArrayToCamel(result);
}