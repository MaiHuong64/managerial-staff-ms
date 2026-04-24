export interface nhiemKyChucVuDTO {
    id: number;
    ngayBatDau: Date;
    ngayKetThuc: Date | null;
    lyDoKetThuc: string | null;
    trangThai: number; // 1: Đang hoạt động, 0/khác: Đã kết thúc
    soQuyetDinh: string | null;
    ngayQuyetDinh: Date | null;
    nguoiPheDuyet: string | null;
    loaiBoNhiem: string | null;
    thoiHan: number | null;
    tenChucDanh: string;
}