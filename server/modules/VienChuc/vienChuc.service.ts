import bcrypt from "bcryptjs";
import pool from "../../config/db";
import { CreateStaffDTO, StaffProfileResult, UpdateStaffDTO } from "./vienChuc.dto";
import * as vienChucService from "./vienChuc.repository";
import {createTaiKhoan} from "../TaiKhoan/taiKhoan.service";


export const getAllStaff = async () => {
    return vienChucService.findAll();
};

export const getStaffById = async (id: number) => {
    const staff = await vienChucService.findById(id);
    if (!staff) throw new Error("Không tìm thấy viên chức");
    return staff;
};

export const getProfile = async (uid: number): Promise<StaffProfileResult> => {
    const data = await vienChucService.findProfileData(uid);
    if (!data || !data.profile) throw new Error("Không tìm thấy hồ sơ viên chức");
    return data as StaffProfileResult;
};

export const createStaff = async (data: CreateStaffDTO) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const maVienChuc = await vienChucService.getNextStaffCode(client);
        const newStaff = await vienChucService.insertVienChuc(client, maVienChuc, data);
        console.log("New staff created with ID:", newStaff);
      
        await createTaiKhoan(client, newStaff.id, newStaff.maVienChuc);

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
  
    const updated = await vienChucService.updateById(id, payload);
    if (!updated) throw new Error("Không tìm thấy viên chức");
    return updated;
};

export const deleteStaff = async (id: number) => {
    await vienChucService.softDeleteById(id);
};

export const getStaffbyDepartment = async (donViId: number) => {
      return vienChucService.getVienChucByDonVi(donViId);
}

export const getHoSoVienChuc = async (vienChucId: number) => {
    const data = await vienChucService.findHoSoVienChuc(vienChucId);
    if (!data || !data.profile) throw new Error("Không tìm thấy hồ sơ viên chức");
    return data as StaffProfileResult;
}