
export interface VienChuc {
    id: number;
    maVienChuc: string | null;
    hoVaTen: string;
    gioiTinh: number | string, // 0: nam, 1: nu, 2: khac
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
    trinhDoLyLuanCt: string;
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