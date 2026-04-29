export interface CreateXepLoaiVcDTO {
  namDanhGia: number;
  danhGia: string;
  nhanXet?: string;
  vienChucId: number;
}
export interface XepLoaiDangVien {
  id: number;
  namDanhGia: number;
  danhGia: string;
  nhanXet: string | null;
  vienChucId: number;
  maVienChuc: string;
  hoVaTen: string;
  tenDonVi: string;
}
 
export interface DieuKienQuyHoach {
  vienChucId: number;
  hoVaTen: string;
  // Xếp loại VC
  duDieuKienVc: boolean;
  lyDoVc: string;
  haiNamGanNhatVc: { namDanhGia: number; danhGia: string }[];
  // Xếp loại đảng viên (null nếu không phải đảng viên)
  laDangVien: boolean;
  duDieuKienDangVien: boolean | null;
  lyDoDangVien: string | null;
  haiNamGanNhatDangVien: { namDanhGia: number; danhGia: string }[] | null;
  // Tổng hợp
  duDieuKienTongHop: boolean;
}
