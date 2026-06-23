import { PoolClient } from "pg";
import pool from "../../config/db";
import ExcelJS from 'exceljs';
import * as DotQuyHoachDTO from "./dotQuyHoach.dto";
import * as DotQuyHoachRepository from "./dotQuyHoach.repository";

export const fetchAllDotQuyHoach = async () => {
    const data = await DotQuyHoachRepository.getAllDotQuyHoach();
    return data;
}

export const fetchDotQuyHoachGoc = async () => {
    const data = await DotQuyHoachRepository.getDotQuyHoachGoc();
    return data;
}

export const findDotQuyHoachById = async (id: number) => {
    const planning = await DotQuyHoachRepository.getDotQuyHoachById(id);
    if (!planning)
        throw new Error(`Không tìm thấy đợt quy hoạch với id: ${id}`);
    const staff = await DotQuyHoachRepository.getChiTietDotQuyHoach(id);
    return { planning, staff };
}
export const createDotQuyHoach = async(payload: DotQuyHoachDTO.CreateDotQuyHoachDTO) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const dotQuyHoach = await DotQuyHoachRepository.insertDotQuyHoach(client, payload);

        if (payload.loaiQuyHoach === 2 && payload.dotGocId) {
            await DotQuyHoachRepository.copyChiTietFromDotGoc(client, dotQuyHoach.id, payload.dotGocId);
        }

        await client.query("COMMIT")
        return dotQuyHoach;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally{
        client.release();
    }
}   

export const addUngVien_QT169 = async(payload: DotQuyHoachDTO.ChiTietDotQuyHoachDTO) => {
    const client = await pool.connect();

    try {
        const dotQHId = await DotQuyHoachRepository.getDotQuyHoachById(payload.dotQuyHoachId);
        if(!dotQHId) throw new Error(`Không tìm thấy đợt quy hoạch với id: ${payload.dotQuyHoachId}`);
        await client.query("BEGIN");
        for (const vienChucId of payload.vienChucId)
            await DotQuyHoachRepository.insertUngVien_QT169(client, payload.dotQuyHoachId, vienChucId, payload.chucDanhId, payload.donViId, 2);
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
export const fetchVienChucByChucDanh  = async (chucDanhId: number) => {
    return await DotQuyHoachRepository.getVienChucByChucDanhId(chucDanhId);
}
export const filterVienChucQuyHoach = async (donViId: number, dotQuyHoachId: number) => {
    const result = await DotQuyHoachRepository.filterVienChuc(donViId, dotQuyHoachId);
    return result;
}

export const approveDotQuyHoach = async (dotQuyHoachId: number, payload: DotQuyHoachDTO.ApproveDotQuyHoachDTO) => {
    const planning = await DotQuyHoachRepository.getDotQuyHoachById(dotQuyHoachId);
    if (!planning) {
        throw new Error(`Không tìm thấy đợt quy hoạch với id: ${dotQuyHoachId}`);
    }
    
    if (planning.trangThai !== 1) {
        throw new Error("Chỉ có thể phê duyệt đợt quy hoạch đã hoàn thành");
    }

    const result = await DotQuyHoachRepository.updatePheDuyetDotQuyHoach(dotQuyHoachId, payload.soQdPheDuyet, payload.ngayQdPheDuyet);
    return result;
}

export const addUngVien_QT170 = async (payload: DotQuyHoachDTO.CreateUngVienDTO) => {
    const client = await pool.connect();
    try {
       await client.query("BEGIN");
       const result =  await DotQuyHoachRepository.insertUngVien_QT170(client, payload);
       await client.query("COMMIT");
       return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export const getDotQuyHoachHienTai = async () => {
    const year = new Date().getFullYear();
    const result = await DotQuyHoachRepository.getDotQuyHoachbyCurrentYear(year);
    return result;
}
export const exportDanhSachExcel = async (dotQuyHoachId:  number) => {
    const dotQH = await DotQuyHoachRepository.getThongTinDotQH(dotQuyHoachId);
    if(!dotQH)
        throw new Error ("Không tìm thấy đợt quy hoạch");
    const danhSachNhanSu = await DotQuyHoachRepository.getDanhSachNhanSu(dotQuyHoachId);
    
    console.log('data: ', danhSachNhanSu);
    console.log('so luong: ', danhSachNhanSu.length);
    console.log('firs data: ', danhSachNhanSu[0]);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Danh sách')
    sheet.columns = [
        {key: "STT", width: 6}, 
        {key: "hoVaTen", width: 22},
        {key: "donViCongTac", width: 25},
        {key: 'chucVuHienTai', width: 25},
        {key: "chucDanhQuyHoach", width: 25},
        {key: "ghiChu", width: 20} 
    ]

    sheet.mergeCells('A1:F1');
    const cell = sheet.getCell('A1');
    cell.value = "TÊN ĐƠN VỊ";
    cell.font = {bold: true, size: 13};
    cell.alignment = {horizontal: "center"};

    sheet.mergeCells('A2:F2');
    const cellTitle = sheet.getCell('A2');
    cellTitle.value = "DANH SÁCH NHÂN SỰ ĐỀ XUẤT NGUỒN QUY HOẠCH CÁN BỘ QUẢN LÝ";
    cellTitle.font = {bold: true, size: 15, name:"Times New Roman"};
    cellTitle.alignment = {horizontal: "center", vertical: "middle"};

    sheet.mergeCells('A3:F3');
    const cellDotQH = sheet.getCell('A3');
    cellDotQH.value = `Đợt ${dotQH.tenQuyHoach}`
    cellDotQH.alignment = {horizontal: 'center'};

    const headerRow = sheet.getRow(6);
    headerRow.values = ['STT', 'Họ và tên', 'Đơn vị công tác', 'Chức danh hiện tại', 'Chức danh quy hoạch', 'Ghi chú'];
    headerRow.font = {bold: true};
    headerRow.eachCell((cell) => {
        cell.border = {
            top: {style: 'thin'}, left:  {style: 'thin'},
            bottom: {style: 'thin'}, right: {style: 'thin'}
        }
    })
    danhSachNhanSu.forEach((uv: any, index: number) => {
        const row = sheet.addRow([
            index + 1,
            uv.hoVaTen,
            uv.donViCongTac,
            uv.chucDanhHienTai || '',
            uv.chucDanhQuyHoach,
            ''
        ]);
        row.eachCell((cell) => {
            cell.border = {
                top: {style: 'thin'}, left:  {style: 'thin'},
                bottom: {style: 'thin'}, right: {style: 'thin'}
            }
        })
    })
    
    const lastRow = sheet.lastRow!.number + 2; // xuống 2 dòng từ dòng có data
     sheet.getCell(`B${lastRow}`).value = 'Người lập danh sách';
    sheet.getCell(`B${lastRow}`).alignment = { horizontal: 'center' };
    sheet.getCell(`E${lastRow}`).value = 'Thủ trưởng đơn vị';
    sheet.getCell(`E${lastRow}`).alignment = { horizontal: 'center' };

    sheet.getCell(`B${lastRow + 1}`).value = '(Ký, ghi rõ họ tên)';
    sheet.getCell(`B${lastRow + 1}`).font = { italic: true, size: 10 };
    sheet.getCell(`B${lastRow + 1}`).alignment = { horizontal: 'center' };
    sheet.getCell(`E${lastRow + 1}`).value = '(Ký, ghi rõ họ tên)';
    sheet.getCell(`E${lastRow + 1}`).font = { italic: true, size: 10 };
    sheet.getCell(`E${lastRow + 1}`).alignment = { horizontal: 'center' };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
}