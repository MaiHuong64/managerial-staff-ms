export interface NhiemKyChucVu {
    id: number;
    ngayBatDau: string;
    ngayKetThuc: string;
    lyDoKetThuc: string;
    trangThai: number;
}

export interface VienChuc {
    id: number;
    maVienChuc: string;
    hoVaTen: string;
    tenDonVi: string;
    chucVuHienTai: string;
    ngach: string;
}

export interface NhiemKy {
    id: string | number;
    chucDanh: string;
    ngayBatDau: string;
    ngayKetThuc: string;
    soQuyetDinh: string;
    ngayQuyetDinh: string;
    nguoiKy: string;
    chucVuNguoiKy: string;
    loaiBoNhiem: string;
    trangThai: 'Đang nhiệm kỳ' | 'Đã kết thúc';
    lyDoKetThuc?: string;
}
export interface NhiemKyHienTai {
    id: string | number;
    chucDanh: string;
    ngayBatDau: string;
    ngayKetThuc: string;
    soQuyetDinh: string;
    ngayQuyetDinh: string;
    nguoiKy: string;
    chucVuNguoiKy: string;
    loaiBoNhiem: string;
    trangThai: number;
    lyDoKetThuc?: string;
}