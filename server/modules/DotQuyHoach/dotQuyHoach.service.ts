import pool from "../../config/db";
import { AddPlanningBatchDetailDTO, CreatePlanningBatchDTO } from "./dotQuyHoach.dto";
import { filterCandidates, getAllPlanning, getCandidatesByChucDanhId, getDetail, getPlanningById, insertPlanningBatch, insertPlanningDetail } from "./dotQuyHoach.repository";

export const fetchAllPlanning = async () => {
    const data = await getAllPlanning();
    return data;
}
export const findPlanningBatchById = async (id: number) => {
    const planning = await getPlanningById(id);
    if (!planning)
        throw new Error(`Không tìm thấy đợt quy hoạch với id: ${id}`);
    const staff = await getDetail(id);
    return { planning, staff };
}
export const createPlanningBatch = async(payload: CreatePlanningBatchDTO) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const batch = await insertPlanningBatch(client, payload);
        await client.query("COMMIT")
        return batch;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;  
    } finally{
        client.release();
    }
}   
export const addPlanningCandidates = async(payload: AddPlanningBatchDetailDTO) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await insertPlanningDetail(client, payload);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;  
    } finally {
        client.release();
    }
}
export const fetchCandidatesForChucDanh  = async (chucDanhId: number) => {
    return await getCandidatesByChucDanhId(chucDanhId);
}
export const filterPlanningCandidates = async (donViId: number, trinhDoChuyenMon: string, dotQuyHoachId: number) => {
    const result = await filterCandidates(donViId, trinhDoChuyenMon, dotQuyHoachId);
    return result;
}