import * as xlsx from 'xlsx';
import pool from '../../config/db';
import { findStaff, insertImportDV, insertImportVC } from './importXL.repository';
interface ExcelRow {
    ma_vien_chuc: string;
    nam_danh_gia: number;
    xl_vien_chuc: string;
    nx_vien_chuc?: string;
    xl_dang_vien?: string;
    nx_dang_vien?: string;
}
export const xepLoaiVienChuc = async (file: Buffer) => {
    const wb = xlsx.read(file, {type: "buffer"});
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json<ExcelRow>(sheet);
    
    if(rows.length === 0) throw new Error ("File excel rỗng");

    const client = await pool.connect();
    const errors: string[] = [];
    let count = 0;

    try {
        await client.query("BEGIN")
        for(const row of rows) {
            const { ma_vien_chuc, nam_danh_gia, xl_vien_chuc, nx_vien_chuc, xl_dang_vien, nx_dang_vien } = row;
            if (!ma_vien_chuc || !nam_danh_gia || !xl_vien_chuc) {
                errors.push(`Row thiếu dữ liệu bắt buộc: ${ma_vien_chuc}`);
                continue;
            }
            const vcRes = await findStaff(client, ma_vien_chuc);
            if(vcRes.rows.length === 0){
                errors.push(`Không tìm thấy viên chức: ${ma_vien_chuc}`);
                continue;
            }
            const vienChucId = vcRes.rows[0].id;
            await insertImportVC(client, vienChucId, nam_danh_gia, xl_vien_chuc, nx_vien_chuc || '');

            if (xl_dang_vien) {
                await insertImportDV(client, vienChucId, nam_danh_gia, xl_dang_vien, nx_dang_vien || '');
            }

            count++;
        }
        await client.query("COMMIT");
        return { count, total: rows.length, errors };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
