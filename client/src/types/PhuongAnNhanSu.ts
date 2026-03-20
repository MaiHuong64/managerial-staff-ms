export interface PhuongAnNhanSu {
  id: number;
  ma_phuong_an: string;
  ten_phuong_an: string;
  so_to_trinh: string; 
  ngay_to_trinh: string;
  ngay_lap: string;
  ghi_chu: string;
  trang_thai: number;
  so_luong_ung_vien: number;
}
export interface ChiTietPhuongAn {
  id: number;
  ghi_chu: string;
  trang_thai: number;
  phuong_an_id: number;
  chi_tiet_bn_id: number;
}
export interface TaoPhuongAn {
    so_to_trinh: string;
    ngay_to_trinh: string;
    ghi_chu: string;
    danh_sach_ung_vien: {
        chi_tiet_bn_id: number;
        loai_phuong_an: string;
        ghi_chu?: string;
    }[];
}
export interface ThongTinPhuongAn {
  thongTinPA: PhuongAnNhanSu;
  danhSachUngVien: ChiTietPhuongAn[];
}
export interface ThongTinUngVienDat {
  chi_tiet_bn_id: number;
  ma_vien_chuc: string;
  ho_va_ten: string;
  ngay_sinh: string;
  gioi_tinh: number;
  ten_don_vi: string;
  ten_chuc_danh: string;
  ngach: string;
  dan_toc: string;
  ngay_chinh_thuc: string | null;
  trinh_do_chuyen_mon: string;
  trinh_do_ly_luan_CT: string;
  trinh_do_ngoai_ngu: string;
  trinh_do_tin_hoc: string;
  trang_thai: number;
  ghi_chu?: string;
}
