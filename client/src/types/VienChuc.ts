export interface VienChuc {
    id: number;
    ma_vien_chuc: string | null,
    ho_va_ten: string,
    gioi_tinh: number, // 0: nam, 1: nu, 2: khac
    so_cccd: string,
    so_dien_thoai: string,
    email: string,
    dia_chi: string,
    ngay_sinh: string,
    dan_toc: string,
    trinh_do_chuyen_mon: string,
    ngay_ket_nap: string,
    ngay_chinh_thuc: string,
    chuyen_nganh: string,
    ngach: string,
    nam_tot_nghiep: number,
    trinh_do_ly_luan_CT: string,
    trinh_do_ngoai_ngu: string,
    trinh_do_tin_hoc: string,
    ngay_tao: string,
    ngay_cap_nhat: string,
};