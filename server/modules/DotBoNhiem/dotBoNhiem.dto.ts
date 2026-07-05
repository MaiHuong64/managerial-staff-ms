import { BuocHoiNghi } from "./dotBoNhiem.type";

export interface CreateDotBoNhiemDTO {
    tenDotBoNhiem: string;
    ngayBatDau?: Date;
    ngayKetThuc?: Date;
    ngayPheDuyet?: Date;
    soQuyetDinh?: string;
    nguoiLap?: string;
    phieuChuTruong: number[];
}

export interface UpdateDotBoNhiemDTO {
    tenDotBoNhiem?: string;
    ngayBatDau?: Date;
    ngayKetThuc?: Date;
    ngayPheDuyet?: Date;
    soQuyetDinh?: string;
    nguoiLap?: string;
}

export interface PhieuBau {
    chiTietBnId: number;
    soPhieuDongY: number;
    soPhieuKhongDongY: number;
}

export interface KetQuaHoiNghi {
    chiTietDotBoNhiemId: number;
    buocHoiNghi: BuocHoiNghi;
    soNguoiTrieuTap: number;
    soNguoiCoMat: number;
    soPhieuPhatRa: number;
    soPhieuThuVe: number;
    soPhieuHopLe: number;
    ketQuaUngVien: PhieuBau[];
}

export interface DotBoNhiem {
    id: number;
    maDotBoNhiem: string;
    tenDotBoNhiem: string;
}
export interface ChiTietDotBoNhiem {
    id: number;
    dotBoNhiemId: number;
    phieuChuTruongId: number;
}

export interface UngVienQuyHoach {
    id: number;
    vienChucId: number;
}
export interface ChucDanhTrongDot { 
    chiTietDotBoNhiem: number;
    phieuChuTruongId: number;
    tenChucDanh: string;
    soLuongDeXuat: number;
    tenDonVi: string;
    soUngVien: number;
    buocHienTai: number;
}
export interface ThongTinBoNhiem {
    maDotBoNhiem: string;
    tenDotBoNhiem: string;
    ngayBatDau: Date;
    ngayKetThuc: Date;
    soQuyetDinh: string;
    trangThai: number;
    chucDanhBoNhiem: ChucDanhTrongDot[];
}