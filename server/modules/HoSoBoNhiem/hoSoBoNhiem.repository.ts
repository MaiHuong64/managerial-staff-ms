export const getNextCode = async (client: any) => {
    const result = await client.query(
        `SELECT COALESCE(MAX(id), 0) AS max FROM ho_so_bo_nhiem`
    );
    const nextId = Number(result.rows[0].max) + 1;
    return 'HS' + nextId.toString().padStart(4, '0');
};
export const getHoSoBoNhiemById = async (client: any, id: string) => {
    const result = await client.query(
        `SELECT * FROM ho_so_bo_nhiem WHERE id = $1`,
        [id]
    );
    return result.rows[0];
}
const insertHoSoBoNhiem = async (client: any, maHoSo: string, chiTietPA: string, ghiChu: string | null) => {
    const result = await client.query(
        `INSERT INTO ho_so_bo_nhiem (ma_ho_so, ngay_lap, chi_tiet_pa_id, ghi_chu) VALUES ($1, $2, $3, $4) RETURNING *`,
        [maHoSo, new Date(), chiTietPA, ghiChu]
    );
    return result.rows[0];
}

const insertChiTieHS = async (client: any, hoSoId: string, payload: any) => {

}