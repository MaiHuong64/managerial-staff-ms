
export interface VienChuc {
    id: number;
    maVienChuc: string | null;
    hoVaTen: string;
    gioiTinh: number, // 0: nam, 1: nu, 2: khac
    soCccd: string;
    soDienThoai: string;
    email: string;
    diaChi: string;
    ngaySinh: string;
    danToc: string;
    trinhDoChuyenMon: string;
    ngayKetNap: string;
    ngayChinhThuc: string;
    chuyenNganh: string;
    ngach: string;
    namTotNghiep: number;
    trinhDoLyLuanCt: string; // Chữ CT viết thành Ct để khớp với chuẩn auto-map của snake-camel
    trinhDoNgoaiNgu: string;
    trinhDoTinHoc: string;
    ngayTao: string;
    ngayCapNhat: string;
}

export interface DanhSachVienChuc extends VienChuc {
    tenDonVi: string;
    chucVuHienTai: string;
    vaiTro: string;
    trangThai: number;
}