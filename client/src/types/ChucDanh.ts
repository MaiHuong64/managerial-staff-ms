export interface ChucDanh {
    id: number, 
    tenChucDanh: string,
    thoiHanGiuChucVu: number,
    heSoPhuCap: number;
}
export interface CreateChucDanh {
    tenChucDanh: string;
    thoiHanGiuChucVu: number;
    heSoPhuCap: number;
}