export interface PhuongAnNhanSu {
    id: number;
    maPhuongAn: string;
    soToTrinh: string;
    ngayToTrinh: string;
    ngayLap: string;
    ngayPheDuyet: string;
    soUngVien: string;
    trangThai: number;
    ghiChu: string;
    yKienBGH: string;
    chiTiet: ChiTietPA[];
}

export interface ChucDanhWithVienChuc {
    chucDanhId: number;
    vienChucId: number;
}

export interface ChiTietPA {
    chiTietPaId: number;
    maVienChuc: string;
    hoVaTen: string;
    tenChucDanh: string;
    loaiPhuongAn: string;
}

export interface fileHoSo {
    id: number;
    chiTietPaId: number;
    maHoSo: string;
}