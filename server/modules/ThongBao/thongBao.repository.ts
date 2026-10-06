import pool from "../../config/db";
export const create = async ( vc_id: number, tieu_de: string, noi_dung: string, loai_tb: string, data: string) => {
    const query = await pool.query(`INSERT INTO thong_bao (vc_id, tieu_de, noi_dung, loai_tb, data) VALUES ($1, $2, $3, $4, $5) RETURNING *`, 
        [vc_id, tieu_de, noi_dung, loai_tb, data]);
    return query.rows[0];
};

export const findByVcId = async (vc_id: number) => {
    const query = await pool.query(`SELECT * FROM thong_bao WHERE vc_id = $1 ORDER BY created_at DESC LIMIT 10`, [vc_id]);
    return query.rows;
};

// if unReadOnly is true, only count unread notifications
// this function is used to get the count of notifications for a user, optionally filtering for unread notifications only.
export const countByUSerId = async (userId: number, {unReadOnly = false} = {}) => {
    let query = `SELECT COUNT(*) FROM thong_bao WHERE vc_id = $1`;
    if(unReadOnly){
        query += ` AND is_read = false`;
    }
    const result = await pool.query(query, [userId]);
    return Number(result.rows[0].count);
}

export const markAsRead = async (id: number, userId: number) => {
    const query = await pool.query(`
        UPDATE thong_bao 
        SET is_read = true WHERE id = $1 AND vc_id = $2 RETURNING *`, [id, userId]);
    return query.rows[0];
}
export const markAllAsRead = async (userId: number) => {
    const query = await pool.query(`
        UPDATE thong_bao 
        SET is_read = true, updated_at = CURRENT_TIMESTAMP
        WHERE vc_id = $1 AND is_read = false RETURNING *`, [userId]);
    return query.rowCount;
}