import { BuocHoiNghi } from "./dotBoNhiem.type";

export interface AppointmentBatch {
    id: number;
    maDotBoNhiem?: string, 
    tenDotBoNhiem: string;
    ngayBatDau: Date;
    ngayKetThuc: Date;
    ngayPheDuyet: Date;
    soQuyetDinh?: string;
    nguoiLap?: string
}
export interface UpdateAppointmentBatchDTO {
    maDotBoNhiem: any;
    tenDotBoNhiem?: string;
    ngayBatDau?: Date;
    ngayKetThuc?: Date;
    ngayPheDuyet?: Date;
    soQuyetDinh?: string;
    nguoiLap?: string;
}
export interface CreateAppointmentBatchDTO {
    maDotBoNhiem?: string;
    tenDotBoNhiem: string;
    ngayBatDau?: Date;
    ngayKetThuc?: Date;
    soQuyetDinh?: string;
    nguoiLap?: string;
    phieuChuTruongList: InputPCTDTO[];
}
export interface InputPCTDTO{
    phieuChuTruongId: number;
    vienChucId: number[];
}
export interface InsertCandidateDTO {
    chiTietDotBoNhiemId: number;
    vienChucId: number[];
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
