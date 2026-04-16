import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getDotBoNhiemList } from "../../api/dotBoNhiem.api";
import type { DanhSachDotBoNhiem } from "../../types/BoNhiem";
import { AppointmentStatus } from "./AppointmentStatus";
import { AppointmentToolBar } from "./AppointmentToolBar";
import AppointmentTable from "./AppointmentTable";
import CreateBatchModal from "./modals";
import { PageHeader } from "../../components/common/PageHeader";

export const AppointmentPage: React.FC = () => {
    const [data, setData] = useState<DanhSachDotBoNhiem[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState<number | null>(null);

    const statistics = useMemo(() => {
        const total = data.length;
        const completed = data.filter(d => d.buocHienTai === 6).length;
        const inProgress = data.filter(d => d.buocHienTai !== null && d.buocHienTai >= 2 && d.buocHienTai <= 5).length;
        const notStarted = data.filter(d => d.buocHienTai === null).length;
        return { total, completed, inProgress, notStarted };
    }, [data]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getDotBoNhiemList();
            setData(response.data.data || []);
        } catch {
            message.error("Không thể tải dữ liệu đợt bổ nhiệm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredData = useMemo(() => {
        const keyword = searchText.toLowerCase();

        return data.filter(item => {
            const ma = item.maDotBoNhiem?.toLowerCase() || "";
            const ten = item.tenDotBoNhiem?.toLowerCase() || "";

            const matchesSearch =
                ma.includes(keyword) || ten.includes(keyword);

            const matchesFilter =
                filterStatus === null || item.buocHienTai === filterStatus;

            return matchesSearch && matchesFilter;
        });
    }, [data, searchText, filterStatus]);

    return (
        <div className="p-6 min-h-screen bg-slate-50">
            <PageHeader
                title="Đợt bổ nhiệm viên chức"
                description="Quản lý và theo dõi quy trình bổ nhiệm"
                action={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={() => setCreateModalVisible(true)}>
                        Tạo đợt mới
                    </Button>
                }
            />

            <AppointmentStatus {...statistics} />

            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="px-4 py-3 border-b border-slate-100">
                    <AppointmentToolBar
                        onSearch={setSearchText}
                        onFilterChange={setFilterStatus}
                    />
                </div>
                <AppointmentTable data={filteredData} loading={loading} />
            </div>

            <CreateBatchModal
                visible={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                onSuccess={() => { setCreateModalVisible(false); fetchData(); }}
            />
        </div>
    );
};

export default AppointmentPage;
