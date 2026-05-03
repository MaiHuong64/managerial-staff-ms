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
    getVienChucByDonVi,
    findHoSoVienChuc,
} from "./vienChuc.repository";

const ALLOWED_UPDATE_FIELDS = new Set<string>([
    "hoVaTen", "gioiTinh", "ngaySinh", "danToc",
    "soDienThoai", "email", "diaChi",
    "trinhDoChuyenMon", "chuyenNganh", "ngach", "namTotNghiep",
    "trinhDoLyLuanCt", 
    "trinhDoNgoaiNgu", "trinhDoTinHoc",
    "ngayKetNap", "ngayChinhThuc", "donViId",
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
    if (!data || !data.profile) throw new Error("Không tìm thấy hồ sơ viên chức");
    return data as StaffProfileResult;
};

export const createStaff = async (data: CreateStaffDTO) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const maVienChuc = await getNextStaffCode(client);
        const newStaff = await insertVienChuc(client, maVienChuc, data);
        console.log("New staff created with ID:", newStaff);
        const matKhau = await bcrypt.hash("123456", 10);
        await insertTaiKhoan(client, newStaff.maVienChuc, matKhau, newStaff.id);

        await client.query("COMMIT");
        return newStaff;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export const updateStaff = async (id: number, payload: UpdateStaffDTO) => {
  
    const updated = await updateById(id, payload);
    if (!updated) throw new Error("Không tìm thấy viên chức");
    return updated;
};

export const deleteStaff = async (id: number) => {
    await softDeleteById(id);
};

export const getStaffbyDepartment = async (donViId: number) => {
      return getVienChucByDonVi(donViId);
}

export const getHoSoVienChuc = async (vienChucId: number) => {
    const data = await findHoSoVienChuc(vienChucId);
    if (!data || !data.profile) throw new Error("Không tìm thấy hồ sơ viên chức");
    return data as StaffProfileResult;
}