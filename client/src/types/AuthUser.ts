export type VaiTro = 'VC' | 'VCQL' | 'BGH' | 'PTCCT';

export interface AuthUser {
  id: number;
  ten_dang_nhap: string;
  vai_tro: VaiTro;
}