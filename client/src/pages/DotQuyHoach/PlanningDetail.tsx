import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Table, Tag, Spin, Steps } from "antd";
import type { ChiTietQuyHoach, DotQuyHoach } from "../../types/QuyHoach";
import type { ColumnsType } from "antd/es/table";
import {
    ArrowLeftOutlined, TeamOutlined,
    CheckCircleOutlined, UserOutlined, HomeOutlined,
    FormOutlined,
} from "@ant-design/icons";
import VoteQuyHoachModal from "./VoteQuyHoachModal";
import { getDotQuyHoachDetailById } from "../../api/dotQuyHoach.api";
import { StatCard } from "../../components/common/StatCard";

const formatDate = (date: string) =>
    date ? new Date(date).toLocaleDateString("vi-VN") : "—";

export const PlanningDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [staffList, setStaffList] = useState<ChiTietQuyHoach[]>([]);
    const [planning, setPlanning] = useState<DotQuyHoach | null>(null);
    const [loading, setLoading] = useState(true);
    const [voteModalOpen, setVoteModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await getDotQuyHoachDetailById(Number(id));
            const { planning, staff } = result.data.data;
            setPlanning(planning);
            setStaffList(staff);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [id]);

    // Tính currentStep của đợt quy hoạch: Bước nhỏ nhất của các ứng viên chưa hoàn thành/loại
    const currentStep = useMemo(() => {
        const activeCandidates = staffList.filter(s => s.buocHienTai >= 2 && s.buocHienTai <= 5);
        if (activeCandidates.length === 0) return null;
        return Math.min(...activeCandidates.map(s => s.buocHienTai));
    }, [staffList]);

    const canVote = currentStep !== null && [2, 3, 4, 5].includes(currentStep);

    const stats = useMemo(() => ({
        total: staffList.length,
        active: staffList.filter(s => s.trangThai === 1).length,
        exited: staffList.filter(s => s.trangThai !== 1).length,
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
                        <div className="font-semibold text-slate-800 text-sm">{r.hoVaTen}</div>
                        <div className="text-[10px] text-slate-400">{r.maVienChuc}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Đơn vị",
            dataIndex: "tenDonVi",
            render: (val: string) => (
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <HomeOutlined className="text-slate-300 text-xs" />
                    {val}
                </div>
            ),
        },
        {
            title: "Tiến trình",
            dataIndex: "buocHienTai",
            width: 180,
            render: (step: number) => {
                const config: Record<number, { color: string; label: string; icon?: React.ReactNode }> = {
                    2: { color: 'blue', label: 'HN lãnh đạo 1' },
                    3: { color: 'purple', label: 'HN CB chủ chốt' },
                    4: { color: 'orange', label: 'HN mở rộng' },
                    5: { color: 'gold', label: 'HN lãnh đạo 2' },
                    6: { color: 'green', label: 'Hoàn thành', icon: <CheckCircleOutlined /> },
                    0: { color: 'red', label: 'Không đạt' },
                };
                const item = config[step] || { color: 'default', label: 'N/A' };
                return <Tag color={item.color} icon={item.icon} className="rounded-full px-3 border-0">{item.label}</Tag>;
            }
        },
        {
            title: "Ngày vào QH",
            dataIndex: "ngayVaoQH",
            width: 120,
            render: (val: string) => <span className="text-xs text-slate-500">{val ? formatDate(val) : "—"}</span>,
        },
        {
            title: "Trạng thái",
            key: "trangThai",
            width: 120,
            render: (_, r) => r.trangThai === 1
                ? <Tag color="success" bordered={false}>Đang QH</Tag>
                : <Tag color="default" bordered={false}>Đã ra khỏi QH</Tag>,
        },
    ];

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50">
            <Spin size="large" tip="Đang tải dữ liệu quy hoạch..." />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* ── Sticky header ─────────────────────────── */}
            <div className="bg-white border-b border-slate-100 px-6 py-4 sticky top-14 z-30 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate("/dot-quy-hoach")}
                            className="text-slate-500 hover:text-blue-600 shrink-0"
                        />
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold text-slate-800 truncate m-0 leading-tight">
                                {planning?.tenQuyHoach}
                            </h1>
                            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">
                                Quy hoạch {planning?.loaiQuyHoach === 1 ? "Đầu nhiệm kỳ" : "Rà soát hàng năm"} · Năm {planning?.namThucHien}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {canVote && (
                            <Button
                                type="primary"
                                icon={<FormOutlined />}
                                onClick={() => setVoteModalOpen(true)}
                                className="bg-blue-600 shadow-blue-100"
                            >
                                Ghi nhận kết quả HN
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* ── Progress Steps ──────────────────────────── */}
                {currentStep !== null && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 flex justify-between">
                            <span>Tiến độ thực hiện hội nghị</span>
                            <span>Bước hiện tại: {currentStep}/5</span>
                        </div>
                        <Steps
                            size="small"
                            current={currentStep ? currentStep - 2 : 4}
                            items={[
                                { title: 'HN Lãnh đạo 1', description: 'Thảo luận' },
                                { title: 'HN CB Chủ chốt', description: 'Lấy phiếu' },
                                { title: 'HN Lãnh đạo MR', description: 'Biểu quyết' },
                                { title: 'HN Lãnh đạo 2', description: 'Chốt danh sách' },
                            ]}
                        />
                    </div>
                )}

                {/* ── Stat cards ──────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard title="Tổng ứng viên" value={stats.total} icon={<TeamOutlined />} color="indigo" />
                    <StatCard title="Đang trong quy trình" value={stats.active} icon={<CheckCircleOutlined />} color="emerald" />
                    <StatCard title="Không đạt / Đã ra" value={stats.exited} icon={<UserOutlined />} color="amber" />
                </div>

                {/* ── Staff table ──────────────────────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                        <div>
                            <div className="font-bold text-slate-800">Danh sách nhân sự quy hoạch</div>
                            <div className="text-xs text-slate-400 mt-0.5">Dữ liệu được cập nhật theo kết quả bỏ phiếu gần nhất</div>
                        </div>
                    </div>
                    <Table
                        dataSource={staffList}
                        columns={columns}
                        rowKey="chi_tiet_id"
                        pagination={{
                            pageSize: 10,
                            showTotal: (total, range) => `${range[0]}–${range[1]} / ${total} viên chức`,
                        }}
                    />
                </div>
            </div>

            {voteModalOpen && currentStep !== null && (
                <VoteQuyHoachModal
                    visible={voteModalOpen}
                    onCancel={() => setVoteModalOpen(false)}
                    onSuccess={() => { setVoteModalOpen(false); fetchData(); }}
                    dotQuyHoachId={Number(id)}
                    candidates={staffList.map(s => ({
                        chi_tiet_qh_id: s.chiTietId,
                        ma_vien_chuc: s.maVienChuc,
                        ho_va_ten: s.hoVaTen,
                        ten_chuc_danh: s.tenChucDanh,
                        ten_don_vi: s.tenDonVi,
                        buoc_hien_tai: s.buocHienTai
                    }))}
                    currentStep={currentStep}
                />
            )}
        </div>
    );
};

export default PlanningDetailPage;