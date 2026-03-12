export interface LoginType {
  ten_dang_nhap: string;
  mat_khau: string;
}
export type VaiTro = 'VC' | 'VCQL' | 'BGH' | 'PTCCT';

export interface AuthUser {
  id: number;
  ten_dang_nhap: string;
  vai_tro: VaiTro;
  ho_va_ten: string;
  avatar: string;
  don_vi_id: number;
}
export interface AuthContextType{
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}