export interface LoginType {
  tenDangNhap: string;
  matKhau: string;
}
export type VaiTro = 'VC' | 'VCQL' | 'BGH' | 'PTCCT';

export interface AuthUser {
  id: number;
  tenDangNhap: string;
  vaiTro: VaiTro;
  hoVaTen: string;
  avatar?: string;
  donViId: number;
}
export interface AuthContextType{
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}