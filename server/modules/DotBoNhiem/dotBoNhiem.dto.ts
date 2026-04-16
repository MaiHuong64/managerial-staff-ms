import { BuocHoiNghi } from "./dotBoNhiem.type";

export interface CreateAppointmentBatchDTO {
    tenDotBoNhiem: string;
    ngayBatDau?: Date;
    ngayKetThuc?: Date;
    ngayPheDuyet?: Date;
    soQuyetDinh?: string;
    nguoiLap?: string;
    phieuChuTruong: number[];
}

export interface UpdateAppointmentBatchDTO {
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

export interface AppointmentBatch {
    id: number;
    maDotBoNhiem: string;
    tenDotBoNhiem: string;
}
export interface AppointmentDetail {
    id: number;
    dotBoNhiemId: number;
    phieuChuTruongId: number;
}

export interface UngVienQuyHoach {
    id: number;
    vienChucId: number;
}