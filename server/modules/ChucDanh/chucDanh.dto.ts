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
// Bắt buộc các phần tử trong CreateChucDanhDTO phải có giá trị, nhưng trong UpdateChucDanhDTO thì tất cả các phần tử đều là tùy chọn (optional) và có thể có giá trị hoặc không
export type UpdateChucDanhDTO = Partial<CreateChucDanhDTO>;