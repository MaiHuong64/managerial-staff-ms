import pool from "../../config/db";
import { mapArrayToCamel, mapToCamel } from "../../utils/mapper";
import { ThongBao } from "./thongBao.type";

export const insertThongBao = async ( vcId: number, tieuDe: string, noiDung: string, loaiTb: string, data: object) => {
    const query = await pool.query(`INSERT INTO thong_bao (vc_id, tieu_de, noi_dung, loai_tb, data) VALUES ($1, $2, $3, $4, $5) RETURNING *`, 
        [vcId, tieuDe, noiDung, loaiTb, data]);
    const result = await pool.query(`SELECT * FROM v_thong_bao WHERE id = $1`, [query.rows[0].id]);
    return mapToCamel<ThongBao>(result.rows[0])
};

export const findByVcId = async (vcId: number, loaiTb?: string) => {
    let query = `SELECT * FROM v_thong_bao WHERE vc_id = $1 ORDER BY created_at DESC LIMIT 10`;
    if (loaiTb) {
        query += ` AND loai_tb = $2`;
    }
    const result = await pool.query(query, loaiTb ? [vcId, loaiTb] : [vcId]);
    return mapArrayToCamel<ThongBao>(result.rows);
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

export const countUnread = async (vcId: number) => {
    const result = await pool.query(`SELECT COUNT(*)::int AS count FROM thong_bao WHERE vc_id = $1 AND is_read = false`,[vcId])
    return result.rows[0].count;
}