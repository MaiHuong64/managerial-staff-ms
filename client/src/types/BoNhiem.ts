// Danh sách đợt
export interface DanhSachDotBoNhiem {
    id: number;
    maDotBoNhiem: string;
    tenDotBoNhiem: string;
    ngayBatDau: string;
    ngayKetThuc: string;
    soQuyetDinh?: string;
    soPhieu: number;
    buocHienTai: number | null;
}

// Chi tiết chức danh trong một đợt
export interface ChucDanhDeXuat {
    chiTietDotId: number;
    phieuChuTruongId: number;
    tenChucDanh: string;
    tenDonVi: string;
    soLuongDeXuat: number;
    soUngVien: number;
    buocHienTai: number;
}

// Chi tiết đợt
export interface ChiTietDotBoNhiem {
    id: number;
    maDotBoNhiem: string;
    tenDotBoNhiem: string;
    trangThai: number;
    ngayBatDau: string;
    ngayKetThuc: string;
    soQuyetDinh?: string;
    chucDanhList: ChucDanhDeXuat[];
}

// Thông tin ứng viên cụ thể
export interface UngVienBoNhiem {
    chiTietBnId: number;
    vienChucId: number;
    maVienChuc: string;
    hoVaTen: string;
    tenDonVi: string;
    tenChucDanh: string;
    lyDoVao: string;
    trangThai: number;
}