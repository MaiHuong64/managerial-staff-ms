export interface CreatePlanningBatchDTO {
    tenQuyHoach: string;
    loaiQuyHoach: 1 | 2; //1: đầu nhiệm kỳ, 2: rà soát hằng năm
    namThucHien: number;
    nhiemKy?: string;
    soQdPheDuyet?: string;
    ngayQdPheDuyet?: Date;
    dotGocId?: number;   // chỉ dùng khi loaiQuyHoach = 2
}
export interface ChucDanhItem {
    vienChucId: number[];
    chucDanhId: number;
}
export interface AddPlanningBatchDetailDTO {
    dotQuyHoachId: number;
    vienChucId:number [];
    chucDanhId: number;
    donViId: number;
    ngayVaoQh?: Date;
}