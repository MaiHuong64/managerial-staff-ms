export interface CreateQDBoNhiemDTO {
    id: number;
    maBoNhiem: string;
    soQuyetDinh: string;
    ngayQuyetDinh: Date;
    ngayCoHieuLuc: Date;
    thoiHan: number;
    loaiBoNhiem: string | number;
    nguoiPheDuyet: string;
    chucVu: string;
}