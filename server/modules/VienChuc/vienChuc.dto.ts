export interface CreateStaffDTO {
    hoVaTen: string;
    gioiTinh: string;
    ngaySinh: string;
    danToc: string;
    soCccd: string;
    soDienThoai: string;
    email: string;
    diaChi: string;
    trinhDoChuyenMon: string;
    chuyenNganh: string;
    ngach: string;
    namTotNghiep: number;
    trinhDoLyLuanCt: string;
    trinhDoNgoaiNgu: string;
    trinhDoTinHoc: string;
    ngayKetNap: string;
    ngayChinhThuc: string;
    donViId: number;
}

// Các field được phép cập nhật (loại trừ soCccd)
export type UpdateStaffDTO = Partial<Omit<CreateStaffDTO, "soCccd">>;

export interface StaffProfileResult {
    profile: Record<string, any>;
    lichSuChucVu: Record<string, any>[];
    xepLoaiVc: Record<string, any>[];
    xepLoaiDangVien: Record<string, any>[];
}