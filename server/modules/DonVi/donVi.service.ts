import { findAll, findById } from "./donVi.repository";

export const getAllDonVi = async () => {
    return findAll();
};

export const getDonViById = async (id: number) => {
    const donVi = await findById(id);
    if (!donVi) throw new Error(`Không tìm thấy đơn vị với id = ${id}`);
    return donVi;
};
