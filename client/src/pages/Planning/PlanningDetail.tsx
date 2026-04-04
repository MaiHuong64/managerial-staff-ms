import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Table, Tag, Spin } from "antd";
import type { ChiTietQuyHoach } from "../../types/ChiTietQuyHoach";
import type { ColumnsType } from "antd/es/table";
import {
    ArrowLeftOutlined, PlusOutlined, TeamOutlined,
    CheckCircleOutlined, UserOutlined, HomeOutlined,
} from "@ant-design/icons";
import { AddStaffsModal } from "./AddStaffsModal";
import { getDotQuyHoachDetailById } from "../../api/dotQuyHoach.api";
import { StatCard } from "../../components/common/StatCard";

const formatDate = (date: string) =>
    date ? new Date(date).toLocaleDateString("vi-VN") : "—";

const InfoField = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</div>
        <div className="text-sm font-medium text-slate-800">{value ?? <span className="text-slate-300">—</span>}</div>
    </div>
);

export const PlanningDetailPage: React.FC = () => {
    const { id }    = useParams();
    const navigate  = useNavigate();

    const [staffList, setStaffList] = useState<ChiTietQuyHoach[]>([]);
    const [planning, setPlanning]   = useState<ChiTietQuyHoach | null>(null);
    const [loading, setLoading]     = useState(true);
    const [addModalOpen, setAddModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await getDotQuyHoachDetailById(Number(id));
            const { planning, staff } = result.data;
            setPlanning(planning);
            setStaffList(staff);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [id]);

    const stats = useMemo(() => ({
        total:     staffList.length,
        active:    staffList.filter(s => s.trang_thai === 1).length,
        exited:    staffList.filter(s => s.trang_thai !== 1).length,
    }), [staffList]);

    const columns: ColumnsType<ChiTietQuyHoach> = [
        {
            title: "Viên chức",
            key: "vc",
            render: (_, r) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <UserOutlined className="text-indigo-600 text-xs" />
                    </div>
                    <div>
                        <div className="font-semibold text-slate-800 text-sm">{r.ho_va_ten}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Đơn vị",
            dataIndex: "ten_don_vi",
            render: (val: string) => (
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <HomeOutlined className="text-slate-300 text-xs" />
                    {val}
                </div>
            ),
        },
        {
            title: "Ngày vào QH",
            dataIndex: "ngay_vao_qh",
            width: 130,
            align: "center",
            render: (val: string) => (
                <span className="text-sm text-slate-600">{val ? formatDate(val) : "—"}</span>
            ),
        },
        {
            title: "Ngày ra khỏi QH",
            dataIndex: "ngay_ra_khoi_qh",
            width: 150,
            align: "center",
            render: (val: string) => (
                <span className="text-sm text-slate-400">{val ? formatDate(val) : "—"}</span>
            ),
        },
        {
            title: "Lý do ra",
            dataIndex: "ly_do_ra_khoi_quy_hoach",
            render: (val: string) => val
                ? <span className="text-sm text-slate-600">{val}</span>
                : <span className="text-slate-300 text-xs italic">—</span>,
        },
        {
            title: "Trạng thái",
            key: "trang_thai",
            width: 140,
            render: (_, r) => r.trang_thai === 1
                ? <Tag color="green"  className="rounded-full px-3 text-xs border-0">Đang quy hoạch</Tag>
                : <Tag color="default" className="rounded-full px-3 text-xs border-0">Đã ra khỏi QH</Tag>,
        },
    ];

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50">
            <Spin size="large" />
        </div>
    );
    if (!planning) return (
        <div className="flex justify-center items-center min-h-screen text-red-500">Không tìm thấy dữ liệu</div>
    );

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ── Sticky header ─────────────────────────── */}
            <div className="bg-white border-b border-slate-100 px-6 py-4 sticky top-14 z-30 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate("/dot-quy-hoach")}
                            className="text-slate-500 hover:text-indigo-600 shrink-0"
                        />
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold text-slate-800 truncate m-0 leading-tight">
                                {planning.ten_quy_hoach || "Chi tiết quy hoạch"}
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Tag
                                    color={planning.loai_quy_hoach === 1 ? "purple" : "cyan"}
                                    className="rounded-full px-2.5 text-xs border-0 m-0"
                                >
                                    {planning.loai_quy_hoach === 1 ? "Đầu nhiệm kỳ" : "Rà soát hằng năm"}
                                </Tag>
                                <Tag
                                    color={planning.trang_thai === 1 ? "green" : "orange"}
                                    className="rounded-full px-2.5 text-xs border-0 m-0"
                                >
                                    {planning.trang_thai === 1 ? "Hoàn thành" : "Đang xử lý"}
                                </Tag>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setAddModalOpen(true)}
                    >
                        Thêm nguồn nhân sự
                    </Button>
                </div>
            </div>

            <div className="p-6 space-y-5">

                {/* ── Stat cards ──────────────────────────── */}
                <div className="grid grid-cols-3 gap-4">
                    <StatCard title="Tổng viên chức" value={stats.total}  icon={<TeamOutlined />}         color="indigo"  />
                    <StatCard title="Đang quy hoạch"  value={stats.active} icon={<CheckCircleOutlined />}  color="emerald" />
                    <StatCard title="Đã ra khỏi QH"   value={stats.exited} icon={<UserOutlined />}         color="amber"   />
                </div>

                {/* ── Info card ────────────────────────────── */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                        Thông tin đợt quy hoạch
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        <InfoField label="Loại quy hoạch"
                            value={planning.loai_quy_hoach === 1 ? "Đầu nhiệm kỳ" : "Rà soát hằng năm"} />
                        <InfoField label="Năm thực hiện"
                            value={planning.nam_thuc_hien} />
                        <InfoField label="Số quyết định"
                            value={planning.so_qd_phe_duyet
                                ? <span className="text-indigo-600">{planning.so_qd_phe_duyet}</span>
                                : <span className="text-slate-300 italic text-xs">Chưa có</span>
                            } />
                        <InfoField label="Ngày quyết định"
                            value={formatDate(planning.ngay_qd_phe_duyet)} />
                    </div>
                </div>

                {/* ── Staff table ──────────────────────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <div className="font-semibold text-slate-800">Danh sách viên chức trong quy hoạch</div>
                        <div className="text-xs text-slate-400 mt-0.5">{stats.total} viên chức · {stats.active} đang quy hoạch</div>
                    </div>
                    <Table
                        dataSource={staffList}
                        columns={columns}
                        rowKey="id"
                        pagination={{
                            pageSize: 15,
                            showTotal: (total, range) => `${range[0]}–${range[1]} / ${total} viên chức`,
                        }}
                    />
                </div>
            </div>

            <AddStaffsModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSuccess={() => { setAddModalOpen(false); fetchData(); }}
                dotQuyHoachId={Number(id)}
            />
        </div>
    );
};

export default PlanningDetailPage;
