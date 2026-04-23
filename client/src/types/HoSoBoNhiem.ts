export interface TaiLieu {
    id: number;
    tenTaiLieu: string;
    loaiTaiLieu: number;
    fileDinhKem: string;
    ngayCapNhat: string;
}

export interface HoSo {
    id: number;
    maHoSo: string;
    ngayLap: string;
    trangThai: number;
    ghiChu: string;
    hoVaTen: string;
    maVienChuc: string;
    tenChucDanh: string;
    tenDonVi: string;
    loaiBoNhiem: string;
    taiLieu: TaiLieu[];
}

export const LOAI_TAI_LIEU_MAP: Record<number, string> = {
    1: 'Lý lịch cá nhân (mẫu 2C)',
    2: 'Bằng cấp / Chứng chỉ',
    3: 'Phiếu đánh giá cán bộ',
    4: 'Đơn đề nghị bổ nhiệm',
    5: 'Quyết định bổ nhiệm cũ',
    6: 'Văn bản khác',
};