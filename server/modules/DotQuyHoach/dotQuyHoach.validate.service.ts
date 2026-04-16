import { BuocHoiNghiQH, KetQuaHoiNghiQH, KetQuaPhieuBauQH} from "./dotQuyHoach.validate.type";
import { getBuocHienTaiByDot, getUngVienByDotAndBuoc, insertKetQuaQuyHoach, updateBuocHienTaiById, upsertKetQuaBuoc2, } from "./dotQuyHoach.validate.repository";
import pool from "../../config/db";

export const validateVoteInput = (data: KetQuaHoiNghiQH) => {
    if(!data.dotQHId || !data.buocHoiNghi) 
        throw new Error ("Thiếu thông tin bắc buộc")
    if(data.soNguoiCoMat > data.soNguoiTrieuTap) 
        throw new Error("Số người có mặt không vượt quá số người triệu tập ")
}

export const processStep2 = async (client: any, data: KetQuaHoiNghiQH) => {
    for(const uv of data.ketQuaUngVien){
        await upsertKetQuaBuoc2(client, [uv.chiTietQHId, data.buocHoiNghi, data.soNguoiTrieuTap, data.soNguoiCoMat])
        await updateBuocHienTaiById(client, BuocHoiNghiQH.HoiNghiCBChuChot, uv.chiTietQHId)
    }
}

// Bước 3: HN CB chủ chốt — phiếu kín, ngưỡng >= 30% có mặt
export const processStep3 = async (client: any, data: KetQuaHoiNghiQH) => {
    const nguong = data.soNguoiCoMat * 0.30
    for(const uv of data.ketQuaUngVien){
        if(uv.soPhieuDongY + uv.soPhieuKhongDongY !== data.soPhieuHopLe)
            throw new Error(`Ứng viên ${uv.chiTietQHId}: tổng phiếu không khớp`);
        const ketQua = uv.soPhieuDongY >= nguong ? KetQuaPhieuBauQH.Dat : KetQuaPhieuBauQH.KhongDat

        await insertKetQuaQuyHoach(client, [uv.chiTietQHId, data.buocHoiNghi, data.soNguoiTrieuTap, data.soNguoiCoMat, data.soPhieuPhatRa, data.soPhieuThuVe,
            data.soPhieuHopLe, uv.soPhieuDongY, uv.soPhieuKhongDongY, ketQua
        ])
        const nextStep = ketQua === KetQuaPhieuBauQH.Dat ? BuocHoiNghiQH.HoiNghiLanhDaoMoRong : 0
        await updateBuocHienTaiById(client, nextStep, uv.chiTietQHId);
    }
}

// Bước 4: phiếu kín, ngưỡng > 50% số có mặt
const processStep4  = async (client: any, data: KetQuaHoiNghiQH) => {
    const nguong = data.soNguoiCoMat * 0.50;
    for(const uv of data.ketQuaUngVien) {
        if(uv.soPhieuDongY + uv.soPhieuKhongDongY !== data.soPhieuHopLe)
            throw new Error (`Ứng viên ${uv.chiTietQHId}: tổng số phiếu không khớp`)
        const ketQua = uv.soPhieuDongY > nguong ? KetQuaPhieuBauQH.Dat : KetQuaPhieuBauQH.KhongDat
        await insertKetQuaQuyHoach(client, [uv.chiTietQHId, data.buocHoiNghi, data.soNguoiTrieuTap, data.soNguoiCoMat, data.soPhieuPhatRa, data.soPhieuThuVe,
            data.soPhieuHopLe, uv.soPhieuDongY, uv.soPhieuKhongDongY, ketQua
        ])
        const nextStep = ketQua === KetQuaPhieuBauQH.Dat ? BuocHoiNghiQH.HoiNghiLanhDaoLan2 : 0
        await updateBuocHienTaiById(client, nextStep, uv.chiTietQHId);
    }
}
//Bước 5: HN lãnh đạo lần 2 — phiếu kín, ngưỡng > 50% triệu tập
const processStep5 = async (client: any, data: KetQuaHoiNghiQH) => {
    for(const uv of data.ketQuaUngVien) {
        if(uv.soPhieuDongY + uv.soPhieuKhongDongY !== data.soPhieuHopLe)
            throw new Error (`Ứng viên ${uv.chiTietQHId}: tổng số phiếu không khớp`)
        const tiLe = data.soNguoiTrieuTap > 0 ? uv.soPhieuDongY / data.soNguoiTrieuTap : 0
        const ketQua = tiLe > 0.5 ? KetQuaPhieuBauQH.Dat : KetQuaPhieuBauQH.KhongDat
        await insertKetQuaQuyHoach(client, [uv.chiTietQHId, data.buocHoiNghi, data.soNguoiTrieuTap, data.soNguoiCoMat, data.soPhieuPhatRa, data.soPhieuThuVe,
            data.soPhieuHopLe, uv.soPhieuDongY, uv.soPhieuKhongDongY, ketQua
        ])
        const nextStep = ketQua === KetQuaPhieuBauQH.Dat ? BuocHoiNghiQH.HoanThanh : 0
        await updateBuocHienTaiById(client, nextStep, uv.chiTietQHId);
    }
};

export const submitVoteResult = async (data: KetQuaHoiNghiQH) => {
    validateVoteInput(data);
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const current = await getBuocHienTaiByDot(client, data.dotQHId);
        if (!current?.buoc_hien_tai)
            throw new Error("Đợt quy hoạch không có ứng viên đang xử lý");
        const currentStep = Number(current.buoc_hien_tai);

        const ungVien = await getUngVienByDotAndBuoc(client, data.dotQHId, currentStep);
        if (data.ketQuaUngVien.length !== ungVien.length)
            throw new Error(`Số ứng viên không khớp: gửi ${data.ketQuaUngVien.length}, DB có ${ungVien.length}`);
        switch (currentStep) {
            case BuocHoiNghiQH.HoiNghiLanhDao:
                await processStep2(client, data); break;
            case BuocHoiNghiQH.HoiNghiCBChuChot:
                await processStep3(client, data); break;
            case BuocHoiNghiQH.HoiNghiLanhDaoMoRong:
                await processStep4(client, data); break;
            case BuocHoiNghiQH.HoiNghiLanhDaoLan2:
                await processStep5(client, data); break;
            default:
                throw new Error("Bước không hợp lệ");
        }
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
    
}
