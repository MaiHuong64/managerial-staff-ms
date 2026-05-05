export interface CreateHoSoDTO {
    chiTietPAId?: number,
    phieuChuTruongId?: number,
    ghiChu?: string
}
export interface UploadFileDTO{
    tenTaiLieu: string,
    loaiTaiLieu: number,
    fileDinhKem: string // path
}
export interface HoSoBoNhiem {
    id: number;
    maHoSo: string;
    ngayLap: Date;
    trangThai: number;
    ghiChu: string | null;
    chiTietPaId: number | null;
    phieuChuTruongId: number | null;
    hoVaTen: string;
    maVienChuc: string;
    tenChucDanh: string;
    tenDonVi: string;
}
export interface DinhDangFile {
    tenTaiLieu: string;
    loaiTaiLieu: number;
    fileDinhKem: string;
}
export enum LoaiTaiLieu {
    LyLich = 1,
    BangCap = 2,
    PhieuDanhGia = 3,
    DonDeNghi = 4,
    QuyetDinhCu = 5,
    VanBanKhac = 6,
}
