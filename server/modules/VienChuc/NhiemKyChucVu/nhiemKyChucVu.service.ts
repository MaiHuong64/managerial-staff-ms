import { getHistoryByStaffId } from "./nhiemKyChucVu.repository";
import { nhiemKyChucVuDTO } from "./nhiemKyChucVu.dto";
import dayjs from 'dayjs';

interface NhiemKyWithWarning extends nhiemKyChucVuDTO {
    monthsRemaining?: number;
    warningLevel?: 'critical' | 'warning' | null;
}

export const getNhiemKyByStaffId = async (vienChucId: number) => {
    const allTerms = await getHistoryByStaffId(vienChucId);

    const nhiemKyHienTai = allTerms.find((nk) => nk.trangThai === 1) || null;

    const lichSuNhiemKy = allTerms.filter((nk) => nk.trangThai !== 1);

    if (nhiemKyHienTai && nhiemKyHienTai.ngayKetThuc) {
        const monthsRemaining = dayjs(nhiemKyHienTai.ngayKetThuc).diff(dayjs(), 'month');
        const result: NhiemKyWithWarning = {
            ...nhiemKyHienTai,
            monthsRemaining,
            warningLevel: monthsRemaining < 3 ? 'critical' : monthsRemaining < 6 ? 'warning' : null
        };
        return { nhiemKyHienTai: result, lichSuNhiemKy };
    }

    return { nhiemKyHienTai, lichSuNhiemKy };
};