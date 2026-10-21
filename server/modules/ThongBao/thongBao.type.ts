export interface ThongBao {
  id: number;
  vcId: number;
  tieuDe: string;
  noiDung: string;
  loaiTb: string;
  data: unknown;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}