export interface CreateStaffDTO {
    ho_va_ten: string;
    gioi_tinh: string;
    ngay_sinh: string;
    dan_toc: string;
    so_cccd: string;
    so_dien_thoai: string;
    email: string;
    dia_chi: string;
    trinh_do_chuyen_mon: string;
    chuyen_nganh: string;
    ngach: string;
    nam_tot_nghiep: number;
    trinh_do_ly_luan_CT: string;
    trinh_do_ngoai_ngu: string;
    trinh_do_tin_hoc: string;
    ngay_ket_nap: string;
    ngay_chinh_thuc: string;
    don_vi_id: number;
}

// Các field được phép cập nhật (loại trừ so_cccd và ma_vien_chuc)
export type UpdateStaffDTO = Partial<Omit<CreateStaffDTO, "so_cccd">>;

export interface StaffProfileResult {
    profile: Record<string, any>;
    lich_su_chuc_vu: Record<string, any>[];
    xep_loai_vc: Record<string, any>[];
    xep_loai_dang_vien: Record<string, any>[];
}
