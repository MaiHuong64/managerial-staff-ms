export interface VienChuc {
    id: number;
    ma_vien_chuc: string;
    ma_don_vi: string;
    ho_va_ten: string;
    gioi_tinh: number; // 0: nam, 1: nu, 2: khac
    ngay_sinh: Date;
    dan_toc: string;
    trinh_do_chuyen_mon: string;
    ngay_ket_nap: Date;
    ngay_chinh_thuc: Date;
    chuyen_nganh: string;
    ngach: string;
    nam_tot_nghiep: string;
    trinh_do_ly_luan_CT: string;
    trinh_do_ngoai_ngu: string;
    trinh_do_tin_hoc: string;
};