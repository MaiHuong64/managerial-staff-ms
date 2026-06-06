import dayjs from "dayjs";

export const tuoiNghiHuu: Record<number, number> = {
    1: 62,
    0: 60,
}
export const getTuoiNghHuu = (gioiTinh: number) => {
    const tuoiNghiHuuValue = tuoiNghiHuu[gioiTinh];
    if (!tuoiNghiHuuValue) {
        throw new Error("Tuổi nghỉ hưu không xác định cho giới tính này");
    }
    return tuoiNghiHuuValue;
}
export const TinhNgayKetThuc = (ngayHieuLuc: Date, thoiHan: number, ngaySinh: Date, gioiTinh: number) => {
    const tuoiNghiHuu = getTuoiNghHuu(gioiTinh);
    const ngayNghiHuu = dayjs(ngaySinh).add(tuoiNghiHuu, 'year');
    const ngayKetThucNhiemKy = dayjs(ngayHieuLuc).add(thoiHan, 'month');
    if(ngayNghiHuu.isBefore(ngayKetThucNhiemKy)) 
        throw new Error ("Ngày hiệu lực và thời hạn nhiệm kỳ vượt quá ngày nghỉ hưu của viên chức");
    return ngayKetThucNhiemKy.isBefore(ngayNghiHuu) ? ngayKetThucNhiemKy.toDate() : ngayNghiHuu.toDate();    
}