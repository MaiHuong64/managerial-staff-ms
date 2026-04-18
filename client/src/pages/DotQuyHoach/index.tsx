import React, { useEffect, useMemo, useState } from "react";
import type { DotQuyHoach } from "../../types/QuyHoach";
import {
    PlusOutlined, SearchOutlined,
    FundProjectionScreenOutlined, CheckCircleOutlined, SyncOutlined,
} from "@ant-design/icons";
import { Button, Input, Table, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { PlanningModal } from "./PlanningModal";
import { getDotQuyHoachList } from "../../api/dotQuyHoach.api";
import { PageHeader } from "../../components/common/PageHeader";
import { StatCard } from "../../components/common/StatCard";

export const PlanningPage: React.FC = () => {
    const [planningList, setPlanningList] = useState<DotQuyHoach[]>([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getDotQuyHoachList();
            setPlanningList(res.data.data); 
            console.log(res.data.data);
            
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = useMemo(() => {
        if (!searchText.trim()) return planningList;
        const q = searchText.toLowerCase();
        return planningList.filter(d =>
            d.tenQuyHoach.toLowerCase().includes(q) ||
            d.namThucHien.toString().includes(q)
        );
    }, [planningList, searchText]);

    const stats = useMemo(() => ({
        total: planningList.length,
        dauNhiemKy: planningList.filter(d => d.loaiQuyHoach === 1).length,
        raSoat: planningList.filter(d => d.loaiQuyHoach === 2).length,
        hoanThanh: planningList.filter(d => d.trangThai === 1).length,
    }), [planningList]);

    const cols = [
        {
            title: "Đợt quy hoạch",
            dataIndex: "tenQuyHoach",
            key: "tenQuyHoach",
            render: (text: string, record: DotQuyHoach) => (
                <div>
                    <div className="font-semibold text-slate-800 text-sm">{text}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Năm {record.namThucHien}</div>
                </div>
            ),
        },
        {
            title: "Loại",
            dataIndex: "loaiQuyHoach",
            key: "loaiQuyHoach",
            width: 140,
            render: (val: number) =>
                val === 1
                    ? <Tag color="purple" className="rounded-full px-3 text-xs border-0">Đầu nhiệm kỳ</Tag>
                    : <Tag color="cyan"   className="rounded-full px-3 text-xs border-0">Rà soát</Tag>,
        },
        {
            title: "Nhiệm kỳ",
            dataIndex: "nhiemKy",
            width: 120,
            render: (val: string) => val ?? <span className="text-slate-300 italic text-xs">—</span>,
        },
        
        {
            title: "Số người",
            dataIndex: "soLuong",
            key: "soLuong",
            width: 100,
            align: "center" as const,
            render: (val: number) => (
                <span className="font-bold text-indigo-600">{val}</span>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "trangThai",
            key: "trangThai",
            width: 130,
            render: (val: number) =>
                val === 1
                    ? <Tag color="green"  className="rounded-full px-3 text-xs border-0">Hoàn thành</Tag>
                    : <Tag color="orange" className="rounded-full px-3 text-xs border-0">Đang xử lý</Tag>,
        },
        {
            title: "",
            key: "action",
            width: 48,
            align: "center" as const,
            render: () => (
                <span className="text-slate-300 group-hover:text-indigo-500 transition-colors">→</span>
            ),
        },
    ];

    return (
        <div className="p-6 min-h-screen bg-slate-50">
            <PageHeader
                title="Quy hoạch cán bộ"
                description="Quản lý các đợt quy hoạch viên chức"
                action={
                    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsModalOpen(true)} >
                        Tạo đợt quy hoạch
                    </Button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-5">
                <StatCard title="Tổng đợt quy hoạch" value={stats.total} icon={<FundProjectionScreenOutlined />} color="indigo"  />
                <StatCard title="Đầu nhiệm kỳ" value={stats.dauNhiemKy} icon={<SyncOutlined />} color="sky" />
                <StatCard title="Rà soát hằng năm" value={stats.raSoat} icon={<SyncOutlined />} color="amber" />
                <StatCard title="Hoàn thành" value={stats.hoanThanh} icon={<CheckCircleOutlined />} color="emerald" />
            </div>

            {/* Table card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="px-4 py-3 border-b border-slate-100">
                    <Input
                        prefix={<SearchOutlined className="text-slate-400" />}
                        placeholder="Tìm kiếm đợt quy hoạch..."
                        allowClear
                        style={{ width: 300 }}
                        onChange={e => setSearchText(e.target.value)}
                    />
                </div>
                <Table
                    dataSource={filtered}
                    columns={cols}
                    rowKey="id"
                    loading={loading}
                    onRow={record => ({
                        onClick: () => navigate(`/dot-quy-hoach/${record.id}`),
                        className: "cursor-pointer group hover:bg-slate-50 transition-colors",
                    })}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total, range) => `${range[0]}–${range[1]} / ${total} đợt`,
                    }}
                />
            </div>

            <PlanningModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default PlanningPage;
