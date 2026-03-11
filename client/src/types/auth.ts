export default interface LoginType {
  ten_dang_nhap: string;
  mat_khau: string;
  vai_tro: string
}
export type VaiTro = 'VC' | 'VCQL' | 'BGH' | 'PTCCT';

export interface AuthUser{
  id: number;
  ten_dang_nhap: string;
  vai_tro: VaiTro;
  vien_chuc_id: number;
  ho_va_ten: string;
  avatar: string | null;     
  don_vi_id: number;
  ten_don_vi: string;
}
export interface AuthContextType{
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
}
