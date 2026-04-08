export interface CreateHoSoDTO {
    chiTietPA: number,
    ghiChu?: string
}
export interface UploadFileDTO{
    tenTaiLieu: string,
    loaiTaiLieu: number,
    fileDinhKem: string // path
}