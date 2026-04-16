export interface ChucDanh {
    chiTietDotId: number;
    phieuChuTruongId: number;
    tenChucDanh: string;
    tenDonVi: string;
    soLuongDeXuat: number;
    soUngVien: number;
    buocHienTai: number;
}

export interface DotBoNhiem {
    id: number;
    maDotBoNhiem: string;
    tenDotBoNhiem: string;
    trangThai: number;
    ngayBatDau: string;
    ngayKetThuc: string;
    chucDanhList: ChucDanh[];
}

export interface UngVien {
    chiTietBnId: number;
    vienChucId: number;
    maVienChuc: string;
    hoVaTen: string;
    tenDonVi: string;
    tenChucDanh: string;
    lyDoVao: string;
    trangThai: number;
}