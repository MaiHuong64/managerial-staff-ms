export interface VienChuc{
    
    id: number;
    ma_vien_chuc: string;
    ho_va_ten: string;
    avatar: string | null;
    gioi_tinh: 0 | 1;
    ngay_sinh: string;
    dan_toc: string;
    so_cccd: string;

    so_dien_thoai: string;
    email: string;
    dia_chi: string;

    trinh_do_chuyen_mon: string;
    chuyen_nganh: string;
    nam_tot_nghiep: number;
    ngach: string;
    trinh_do_ly_luan_CT: string | null;
    trinh_do_ngoai_ngu: string | null;
    trinh_do_tin_hoc: string | null;

    ngay_ket_nap: string | null;
    ngay_chinh_thuc: string | null;
    ngay_tao: string;
    ngay_cap_nhat: string;
}