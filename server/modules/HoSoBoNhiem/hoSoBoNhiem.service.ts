import pool from "../../config/db";
import fs from "fs";
import path from "path";
import { checkHoSoExistsByChiTietPAId, checkHoSoExistsByPhieuChuTruongId, deleteChiTietHoSo, getAllHoSo, getChiTietHoSo, getHoSoBoNhiemById, getHoSoByPhieuChuTruongId, getHoSoByPhuongAnId, getNextCode, insertChiTieHS, insertHoSoBoNhiem, updateTrangThaiHoSo } from "./hoSoBoNhiem.repository";
import { CreateHoSoDTO, UploadFileDTO } from "./hoSoBoNhiem.type";

export const getAllHSBN = async () => {
    return await getAllHoSo();
};

export const getByPhuongAnId = async (id: number) => {
    return await getHoSoByPhuongAnId(id);
};

export const getByPhieuChuTruongId = async (id: number) => {
    return await getHoSoByPhieuChuTruongId(id);
};

export const getById = async (id: number) => {
    const client = await pool.connect();
    try {
        const hoSo = await getHoSoBoNhiemById(client, id);
        if (!hoSo) throw new Error("Không tìm thấy hồ sơ bổ nhiệm");
        const chiTiet = await getChiTietHoSo(id);
        return { ...hoSo, taiLieu: chiTiet };
    } finally {
        client.release();
    }
};

export const createHoSo = async (payload: CreateHoSoDTO) => {
    console.log('payload in service:', payload);
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Validate: phải có ít nhất 1 trong 2 (chiTietPAId hoặc phieuChuTruongId)
        if (!payload.chiTietPAId && !payload.phieuChuTruongId) {
            throw new Error("Phải có chi tiết phương án hoặc phiếu chủ trương");
        }
        if (payload.chiTietPAId && payload.phieuChuTruongId) {
            throw new Error("Chỉ được chọn 1 trong 2: chi tiết phương án hoặc phiếu chủ trương");
        }

        // Check duplicate
        if (payload.chiTietPAId) {
            const exist = await checkHoSoExistsByChiTietPAId(client, payload.chiTietPAId);
            if (exist) throw new Error("Hồ sơ từ phương án này đã tồn tại");
        }
        if (payload.phieuChuTruongId) {
            const exist = await checkHoSoExistsByPhieuChuTruongId(client, payload.phieuChuTruongId);
            if (exist) throw new Error("Hồ sơ từ phiếu chủ trương này đã tồn tại");
        }

        const maHoSo = await getNextCode(client);
        const hoSo = await insertHoSoBoNhiem(
            client,
            maHoSo,
            payload.chiTietPAId ?? null,
            payload.phieuChuTruongId ?? null,
            payload.ghiChu ?? null
        );
        await client.query("COMMIT");
        return hoSo;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export const uploadFile = async (hoSoId: number, payload: UploadFileDTO) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const hoSo = await getHoSoBoNhiemById(client, hoSoId);
        if (!hoSo) throw new Error("Không tìm thấy hồ sơ bổ nhiệm");
        if (hoSo.trangThai === 2) throw new Error("Hồ sơ đã hoàn thiện, không thể thêm tài liệu");
        const taiLieu = await insertChiTieHS(client, String(hoSoId), payload);
        await client.query("COMMIT");
        return taiLieu;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export const deleteTaiLieu = async (taiLieuId: number) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const deleted = await deleteChiTietHoSo(client, taiLieuId);
        if (!deleted) throw new Error("Không tìm thấy tài liệu");
        await client.query("COMMIT");
        if (deleted.fileDinhKem) {
            const filePath = path.join(__dirname, "../../uploads", path.basename(deleted.fileDinhKem));
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export const hoanThienHoSo = async (id: number) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const hoSo = await getHoSoBoNhiemById(client, id);
        if (!hoSo) throw new Error("Không tìm thấy hồ sơ bổ nhiệm");
        if (hoSo.trangThai === 2) throw new Error("Hồ sơ đã hoàn thiện");
        const chiTiet = await getChiTietHoSo(id);
        if (chiTiet.length === 0) throw new Error("Hồ sơ phải có ít nhất 1 tài liệu");
        await updateTrangThaiHoSo(client, id, 2);
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};
