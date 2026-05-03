export interface CreateQDBoNhiemDTO {
    id: number;
    maBoNhiem: string;
    soQuyetDinh: string;
    ngayQuyetDinh: Date;
    ngayCoHieuLuc: Date;
    thoiHanGiuChucVu: number;
    ngaySinh: Date;
    gioiTinh: number;
    loaiBoNhiem: string | number;
    nguoiPheDuyet: string;
    chucVu: string;
}