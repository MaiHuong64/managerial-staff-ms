export const getCode = async (client: any) => {
    const result = await client.query(
        `SELECT CONCAT('PDX', LPAD((COALESCE(MAX(id), 0) + 1)::text, 3, '0')) AS ma_phieu_de_xuat
         FROM phieu_de_xuat_nhan_su_quy_hoach`
    );
    return result.rows[0].ma_phieu_de_xuat;
};

export const insertPhieuDeXuat = async (client: any, payload: any, user: any, maPhieu: string) => {
    const { ho_va_ten } = user;
    const result = await client.query (
        `
        INSERT INTO phieu_de_xuat_nhan_su_quy_hoach 
        (ma_phieu_de_xuat, tieu_de, noi_dung, so_luong_de_xuat,
        chuc_danh_id, don_vi_id, nguoi_lap, ngay_lap, trang_thai) VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
        `,[maPhieu, payload.tieuDe, payload.soLuongDeXuat, payload.chucDanhId, payload.ngayLap ?? new Date(), payload.nguoiLap, 0]
    )
    return result.rows[0];
};
export const insertChiTietPhieu = async (client: any, phieuDeXuatId: number) => {
    
}