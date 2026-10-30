import { useEffect, useState } from "react"
import type { ChucDanh } from "../types/ChucDanh"
import { deleteChucDanh, getChucDanhList } from "../api/chucDanh.api";
import { message } from "antd";

export const useChucDanh = () => {
    const [danhSachChucDanh, setDanhSachChucDanh] = useState<ChucDanh[]>([]);
    const [loading, setLoading] = useState(true);

    const fectData = async () => {
        try {
          setLoading(true);
          const res = await getChucDanhList();
          setDanhSachChucDanh(res.data.data || []);
        } catch {
          message.error("Không thể tải danh sách chức danh");
        } finally {
          setLoading(false);
        }
    };

    useEffect(() => {
        fectData();
    }, []);

    const remove = async (id: number) => {
        try {
            await deleteChucDanh(id);
            message.success("Xóa chức danh thành công");
            fectData();
        } catch (error) {
            message.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Lỗi khi xóa chức danh");
        }
    }
    return {danhSachChucDanh, loading, fectData, remove};
}