export interface DotQuyHoach {
    id: number;
    maQuyHoach: string;
    tenQuyHoach: string;
    loaiQuyHoach: number;
    namThucHien: number;
    nhiemKy: string;
    soQuyetDinhPheDuyet: string | null;
    ngayQuyetDinhPheDuyet: string | null;
    trangThai: number;
    count: number;
}

export interface ChiTietQuyHoach {
    chiTietId: number;
    id: number;
    tenQuyHoach: string;
    maQuyHoach: string;
    loaiQuyHoach: number;
    namThucHien: number;

    soQdPheDuyet: string;
    ngayQdPheDuyet: string;

    vienChucId: number;
    hoVaTen: string;
    maVienChuc: string;
    tenDonVi: string;
    tenChucDanh: string;

    ngayVaoQh: string;
    ngayRaQh: string;

    buocHienTai: number;

    soQdRaKhoiQuyHoach: string;
    ngayQdRaKhoiQuyHoach: string;
    lyDoRaKhoiQuyHoach: string;
    trangThai: number;
}

export interface UngVienQuyHoach {
    chiTietQHId: number; 
    maVienChuc: string;
    hoVaTen: string;
    tenChucDanh: string;
    tenDonVi: string;
    buocHienTai: number;
}

export interface DuLieuBauUngVien {
    chiTietQHId: number;
    soPhieuDongY: number;
    soPhieuKhongDongY: number;
}

export interface DuLieuKetQuaHoiNghi {
    dotQHId: number;
    buocHoiNghi: number;
    // loaiQuyHoach: number;   
    soNguoiTrieuTap: number;
    soNguoiCoMat: number;
    soPhieuPhatRa: number;
    soPhieuThuVe: number;
    soPhieuHopLe: number;
    ketQuaUngVien: DuLieuBauUngVien[];
}