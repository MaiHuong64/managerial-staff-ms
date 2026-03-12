export interface LoginType {
  ten_dang_nhap: string;
  mat_khau: string;
}
export type VaiTro = 'VC' | 'VCQL' | 'BGH' | 'PTCCT';

export interface AuthUser {
  id: number;
  ten_dang_nhap: string;
  vai_tro: VaiTro;
}
export interface AuthContextType{
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}