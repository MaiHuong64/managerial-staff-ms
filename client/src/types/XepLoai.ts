export interface XepLoaiVC {
    id: number;
    namDanhGia: number;
    danhGia: string;
    nhanXet: string;
    vienChucId: number;
    maVienChuc?: string;
    hoVaTen?: string;
    tenDonVi?: string;
}

export interface XepLoaiDV {
    id: number;
    namDanhGia: number;
    danhGia: string;
    nhanXet: string;
    vienChucId: number;
    maVienChuc?: string;
    hoVaTen?: string;
    tenDonVi?: string;
}

export interface CreateXepLoaiDTO {
    vienChucId: number;
    namDanhGia: number;
    danhGia: string;
    nhanXet?: string;
}

export interface CheckDieuKienQH {
    duDieuKien: boolean;
    soNamCoKetQua: number;
    thieuNam: number[];
    ketQuaGanNhat: XepLoaiVC[];
}

export const MUC_XEP_LOAI = {
    XUAT_SAC: 'Hoàn thành xuất sắc nhiệm vụ',
    TOT: 'Hoàn thành tốt nhiệm vụ',
    HOAN_THANH: 'Hoàn thành nhiệm vụ',
    KHONG_HOAN_THANH: 'Không hoàn thành nhiệm vụ'
} as const;

export const MUC_XEP_LOAI_OPTIONS = [
    { value: MUC_XEP_LOAI.XUAT_SAC, label: 'Hoàn thành xuất sắc nhiệm vụ', color: 'green' },
    { value: MUC_XEP_LOAI.TOT, label: 'Hoàn thành tốt nhiệm vụ', color: 'blue' },
    { value: MUC_XEP_LOAI.HOAN_THANH, label: 'Hoàn thành nhiệm vụ', color: 'orange' },
    { value: MUC_XEP_LOAI.KHONG_HOAN_THANH, label: 'Không hoàn thành nhiệm vụ', color: 'red' }
];