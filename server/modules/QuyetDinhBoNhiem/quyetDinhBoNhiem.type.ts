export interface QuyetDinhBoNhiem{
    id: number
    maBoNhiem: string;
    soQuyetDinh: string;
    ngayQuyetDinh: Date;
    ngayCoHieuLuc: Date;
    thoiHan: number;
    loaiHoSo: number
}
export interface NhiemKy {
    vienChucId: number;
    chucDanhId: number;
}