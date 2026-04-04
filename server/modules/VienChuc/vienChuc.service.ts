import bcrypt from "bcryptjs";
import pool from "../../config/db";
import { CreateStaffDTO, StaffProfileResult, UpdateStaffDTO } from "./vienChuc.dto";
import {
    findAll,
    findById,
    findProfileData,
    getNextStaffCode,
    insertVienChuc,
    insertTaiKhoan,
    softDeleteById,
    updateById,
} from "./vienChuc.repository";

// Whitelist các field được phép cập nhật để tránh SQL injection
const ALLOWED_UPDATE_FIELDS = new Set<string>([
    "ho_va_ten", "gioi_tinh", "ngay_sinh", "dan_toc",
    "so_dien_thoai", "email", "dia_chi",
    "trinh_do_chuyen_mon", "chuyen_nganh", "ngach", "nam_tot_nghiep",
    "trinh_do_ly_luan_CT", "trinh_do_ngoai_ngu", "trinh_do_tin_hoc",
    "ngay_ket_nap", "ngay_chinh_thuc", "don_vi_id",
]);

export const getAllStaff = async () => {
    return findAll();
};

export const getStaffById = async (id: number) => {
    const staff = await findById(id);
    if (!staff) throw new Error("Không tìm thấy viên chức");
    return staff;
};

export const getProfile = async (uid: number): Promise<StaffProfileResult> => {
    const data = await findProfileData(uid);
    if (!data.profile) throw new Error("Không tìm thấy hồ sơ viên chức");
    return data as StaffProfileResult;
};

export const createStaff = async (data: CreateStaffDTO) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const ma_vien_chuc = await getNextStaffCode(client);
        const newStaff = await insertVienChuc(client, ma_vien_chuc, data);

        const mat_khau = await bcrypt.hash("123456", 10);
        await insertTaiKhoan(client, ma_vien_chuc, mat_khau, newStaff.id);

        await client.query("COMMIT");
        return newStaff;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export const updateStaff = async (id: number, fields: Record<string, any>) => {
    const safeFields: UpdateStaffDTO = {};
    for (const key of Object.keys(fields)) {
        if (ALLOWED_UPDATE_FIELDS.has(key)) {
            (safeFields as any)[key] = fields[key];
        }
    }

    if (Object.keys(safeFields).length === 0) {
        throw new Error("Không có trường hợp lệ để cập nhật");
    }

    const updated = await updateById(id, safeFields);
    if (!updated) throw new Error("Không tìm thấy viên chức");
    return updated;
};

export const deleteStaff = async (id: number) => {
    await softDeleteById(id);
};
