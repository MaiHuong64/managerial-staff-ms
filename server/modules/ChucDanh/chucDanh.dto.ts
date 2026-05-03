export interface ChucDanhDTO {
    id: number;
    maChucDanh: string;
    tenChucDanh: string;
    thoiHanGiuChucVu: number;
    heSoPhuCap: number;
}

export interface CreateChucDanhDTO {
    tenChucDanh: string;
    thoiHanGiuChucVu: number;
    heSoPhuCap: number;
}

export type UpdateChucDanhDTO = Partial<CreateChucDanhDTO>;