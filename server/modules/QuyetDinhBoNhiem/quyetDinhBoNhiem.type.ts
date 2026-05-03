export interface QuyetDinhBoNhiem {
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

export interface NhiemKy {
    vienChucId: number;
    chucDanhId: number;
    gioiTinh: number;
    ngaySinh: Date;
    thoiHan: number;
}