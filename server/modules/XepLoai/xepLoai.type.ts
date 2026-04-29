export interface XepLoaiVC {
    id: number;
    namDanhGia: number;
    danhGia: string;
    nhanXet?: string;
    vienChucId: number;
}

export interface XepLoaiDangVien {
    id: number;
    namDanhGia: number;
    danhGia: string;
    nhanXet?: string;
    vienChucId: number;
}

export interface CreateXepLoaiDTO {
    vienChucId: number;
    namDanhGia: number;
    danhGia: string;
    nhanXet?: string;
}

export interface UpdateXepLoaiDTO {
    danhGia?: string;
    nhanXet?: string;
}

export interface CheckDieuKienResponse {
    duDieuKien: boolean;
    soNamCoKetQua: number;
    thieuNam: number[];
    ketQuaGanNhat: XepLoaiVC[];
}