export interface QuyetDinhBoNhiem {
    id: number;
    hoVaTen: string;
    maVienChuc: string;
    tenChucDanh: string
    soQuyetDinh: string | null;
    ngayQuyetDinh: string | null;
    ngayCoHieuLuc: string | null;
    thoiHan: number | null;
    loaiBoNhiem: string;
    nguoiPheDuyet?: string;
    chucVu: string | null;
    trangThai?: number;
}
