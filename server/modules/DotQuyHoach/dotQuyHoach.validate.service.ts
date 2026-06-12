import pool from "../../config/db";
import { getBuocHienTaiByDotId } from "./dotQuyHoach.validate.repository";
import { KetQuaHoiNghiQH } from "./dotQuyHoach.validate.type";
import { submitVoteResult_QT169 } from "./dotQuyHoach_169.validate.service";
import { submitVoteResult_QT170 } from "./dotQuyHoach_170.validate.service";

export const submitVoteService = async(data: KetQuaHoiNghiQH) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN")
        const currrent = await getBuocHienTaiByDotId(client, data.dotQHId)
        if(!currrent.buoc_hien_tai)
            throw new Error("Đợt quy hoạch không có ứng viên đang xử lý");
        // const currStep = Number(currrent.buoc_hien_tai);
        const loaiQuyHoach = Number(currrent.loai_quy_hoach);
        if(loaiQuyHoach === 1) await submitVoteResult_QT169(client, data)
        else if(loaiQuyHoach === 2) await submitVoteResult_QT170(client, data)
        else throw new Error("Loại quy hoạch không hợp lệ")
        await client.query("COMMIT");
    
    } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(error instanceof Error ? error.message : "Lỗi không xác định");
        // console.log(error);   
    }
    finally{
        client.release()
    }
}