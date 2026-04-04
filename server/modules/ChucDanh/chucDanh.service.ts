import { findAll } from "./chucDanh.repository";

export const getAllChucDanh = async () => {
    return findAll();
};
