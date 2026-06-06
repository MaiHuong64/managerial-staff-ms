import { PoolClient } from "pg";
import * as TaiKhoanRepository from "./taiKhoan.repository";
import bcrypt from "bcrypt";

const DEFAULT_PASSWORD = "123456";

export const updateVaiTro = async (id: number, vaiTro: string) => {
    const validRoles = ['PTCCT', 'BGH', 'VC', 'VCQL', 'ADMIN'];
    if (!validRoles.includes(vaiTro)) {
        throw new Error("Vai trò không hợp lệ");
    }
    return await TaiKhoanRepository.updateVaiTro(id, vaiTro);
};

export const getByVienChucId = async (vienChucId: number) => {
    return await TaiKhoanRepository.findByVienChucId(vienChucId);
};

export const getAllTaiKhoan = async () => {
    return await TaiKhoanRepository.findAll();
};

export const updateTrangThai = async (id: number, trangThai: 0 | 1) => {
    const tk = await TaiKhoanRepository.findById(id);
    if (!tk) throw new Error("Không tìm thấy tài khoản");

    return await TaiKhoanRepository.updateTrangThai(id, trangThai);
};

export const doiMatKhau = async (id: number, matKhauCu: string, matKhauMoi: string) => {
    const tk = await TaiKhoanRepository.findById(id);
    if (!tk) throw new Error("Không tìm thấy tài khoản");

    const khop = await bcrypt.compare(matKhauCu, tk.matKhau);
    if (!khop) throw new Error("Mật khẩu hiện tại không đúng");

    if (matKhauMoi.length < 6) {
        throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
    }

    const hash = await bcrypt.hash(matKhauMoi, 10);
    await TaiKhoanRepository.updateMatKhau(id, hash);
};

export const createTaiKhoan = async (client: PoolClient, vienChucId: number, maVienChuc: string) => {
    const matKhauHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    return await TaiKhoanRepository.insertTaiKhoan(client, vienChucId, maVienChuc, matKhauHash);
}