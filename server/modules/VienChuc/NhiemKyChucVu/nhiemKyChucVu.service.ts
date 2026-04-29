import { getHistoryByStaffId } from "./nhiemKyChucVu.repository";
import { nhiemKyChucVuDTO } from "./nhiemKyChucVu.dto";
import dayjs from 'dayjs';

interface NhiemKyWithWarning extends nhiemKyChucVuDTO {
    soThangConLai?: number;
    mucCanhBao?: 'critical' | 'warning' | null;
}

export const getNhiemKyByStaffId = async (vienChucId: number) => {
    const danhSachNhiemKy = await getHistoryByStaffId(vienChucId);

    const nhiemKyHienTai = danhSachNhiemKy.find((nk) => nk.trangThai === 1) || null;

    const lichSuNhiemKy = danhSachNhiemKy.filter((nk) => nk.trangThai !== 1);

    if (nhiemKyHienTai && nhiemKyHienTai.ngayKetThuc) {
        const soThangConLai = dayjs(nhiemKyHienTai.ngayKetThuc).diff(dayjs(), 'month');
        const result: NhiemKyWithWarning = {
            ...nhiemKyHienTai,
            soThangConLai,
            mucCanhBao: soThangConLai < 3 ? 'critical' : soThangConLai < 6 ? 'warning' : null
        };
        return { nhiemKyHienTai: result, lichSuNhiemKy };
    }

    return { nhiemKyHienTai, lichSuNhiemKy };
};