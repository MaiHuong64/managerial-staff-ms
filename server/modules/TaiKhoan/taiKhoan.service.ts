import { TaiKhoanRepository } from "./taiKhoan.repository";
import bcrypt from "bcrypt";
export const TaiKhoanService = {
    updateVaiTro: async (id: number, vaiTro: string) => {
        const validRoles = ['PTCCT', 'BGH', 'VC', 'VCQL', 'ADMIN'];
        if (!validRoles.includes(vaiTro)) {
            throw new Error("Vai trò không hợp lệ");
        }

        return await TaiKhoanRepository.updateVaiTro(id, vaiTro);
    },

    getByVienChucId: async (vienChucId: number) => {
        return await TaiKhoanRepository.findByVienChucId(vienChucId);
    },

    getAll: async () => {
        return await TaiKhoanRepository.findAll();
    },
    updateTrangThai: async (id: number, trangThai: 0 | 1) => {
        const tk = await TaiKhoanRepository.findById(id);
        if (!tk) throw new Error("Không tìm thấy tài khoản");
 
        if (trangThai !== 0 && trangThai !== 1) {
            throw new Error("Trạng thái không hợp lệ (0 hoặc 1)");
        }
 
        return await TaiKhoanRepository.updateTrangThai(id, trangThai);
    },
    doiMatKhau: async (id: number, matKhauCu: string, matKhauMoi: string) => {
        const tk = await TaiKhoanRepository.findById(id);
        if (!tk) throw new Error("Không tìm thấy tài khoản");
 
        const khop = await bcrypt.compare(matKhauCu, tk.matKhau);
        if (!khop) throw new Error("Mật khẩu hiện tại không đúng");
 
        if (matKhauMoi.length < 6) {
            throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
        }
 
        const hash = await bcrypt.hash(matKhauMoi, 10);
        await TaiKhoanRepository.updateMatKhau(id, hash);
    },
};
