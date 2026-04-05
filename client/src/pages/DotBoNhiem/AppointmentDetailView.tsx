import type React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Steps, Table, Tag, Button, Select, Empty, Spin, Badge } from "antd";
import {
    FormOutlined, PlayCircleOutlined, UserOutlined, HomeOutlined,
    ArrowLeftOutlined, PlusOutlined, TeamOutlined, CheckCircleOutlined,
    CloseCircleOutlined, StopOutlined,
} from "@ant-design/icons";
import VoteModal from "./VoteModal";
import type { ChucDanh, DotBoNhiem, UngVien } from "../../types/ChiTietBoNhiem";
import { getVienChucList } from "../../api/vienChuc.api";
import { getDotBoNhiemById, getCandidatesByChiTietDot, addCandidateToChiTietDot, startVotingProcess } from "../../api/dotBoNhiem.api";

const STATE_MAP: Record<number, { label: string; color: string; badgeStatus: "default" | "warning" | "processing" | "success" | "error" }> = {
    0: { label: "Đã dừng", color: "error", badgeStatus: "error" },
    1: { label: "Đang soạn thảo", color: "default",    badgeStatus: "default"    },
    2: { label: "Hội nghị lãnh đạo (vòng 1)", color: "processing", badgeStatus: "processing" },
    3: { label: "Hội nghị lãnh đạo (vòng 2)", color: "processing", badgeStatus: "processing" },
    4: { label: "Hội nghị cán bộ chủ chốt", color: "processing", badgeStatus: "processing" },
    5: { label: "Hội nghị lãnh đạo (cuối)", color: "processing", badgeStatus: "processing" },
    6: { label: "Hoàn thành", color: "success", badgeStatus: "success"    },
};

const STEP_INDEX: Record<number, number> = { 2: 0, 3: 1, 4: 2, 5: 3, 6: 4 };

const STEP_ITEMS = [
    { title: "Vòng 1",   description: "Hội nghị tập thể lãnh đạo" },
    { title: "Vòng 2",   description: "Hội nghị tập thể lãnh đạo" },
    { title: "Bước 3",   description: "Hội nghị cán bộ chủ chốt"  },
    { title: "Vòng cuối",description: "Hội nghị tập thể lãnh đạo" },
    { title: "Hoàn thành",description: "Quy trình bổ nhiệm hoàn tất" },
];

const CANDIDATE_STATUS: Record<number, { label: string; color: string; bg: string; text: string }> = {
    0: { label: "Đã loại",   color: "default",    bg: "bg-slate-100",   text: "text-slate-500"   },
    1: { label: "Hợp lệ",    color: "success",    bg: "bg-emerald-50",  text: "text-emerald-700" },
    2: { label: "Không đạt", color: "error",      bg: "bg-red-50",      text: "text-red-700"     },
    3: { label: "Đạt",       color: "processing", bg: "bg-indigo-50",   text: "text-indigo-700"  },
};

const InfoField = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</div>
        <div className="text-sm font-medium text-slate-800">{value ?? <span className="text-slate-300">—</span>}</div>
    </div>
);

export const AppointmentDetailView: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [batchInfo, setBatchInfo] = useState<DotBoNhiem | null>(null);
    const [candidates, setCandidates] = useState<UngVien[]>([]);
    const [selectedChucDanh, setSelectedChucDanh] = useState<ChucDanh | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [voteModalVisible, setVoteModalVisible] = useState(false);
    const [allStaff, setAllStaff] = useState<{ id: number; ho_va_ten: string; ma_vien_chuc: string | null }[]>([]);
    const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
    const [addingCandidate, setAddingCandidate] = useState(false);

    const fetchAllStaff = async () => {
        try {
            const res = await getVienChucList();
            setAllStaff(res.data?.data ?? res.data ?? []);
        } catch { /* silently fail */ }
    };

    const fetchDetail = async (keepSelectedId?: number) => {
        try {
            setLoading(true);
            const result = await getDotBoNhiemById(Number(id));
            const batch: DotBoNhiem = result.data.data;
            setBatchInfo(batch);
            if (batch.chuc_danh_list?.length > 0) {
                const target = keepSelectedId
                    ? batch.chuc_danh_list.find(cd => cd.chi_tiet_dot_id === keepSelectedId)
                    : null;
                const selected = target ?? batch.chuc_danh_list[0];
                setSelectedChucDanh(selected);
                fetchCandidates(selected.chi_tiet_dot_id);
            }
        } catch {
            // message handled by parent
        } finally {
            setLoading(false);
        }
    };

    const fetchCandidates = async (chiTietDotId: number) => {
        try {
            setLoadingCandidates(true);
            const result = await getCandidatesByChiTietDot(chiTietDotId);
            setCandidates(result.data.data);
        } catch { /* ignore */ }
        finally { setLoadingCandidates(false); }
    };

    const handleAddCandidate = async () => {
        if (!selectedStaffId || !selectedChucDanh) return;
        try {
            setAddingCandidate(true);
            await addCandidateToChiTietDot(selectedChucDanh.chi_tiet_dot_id, {
                vien_chuc_id: selectedStaffId,
                ly_do_vao: "Nguồn bên ngoài",
                chi_tiet_qh_id: null,
            });
            setSelectedStaffId(null);
            fetchCandidates(selectedChucDanh.chi_tiet_dot_id);
            fetchDetail(selectedChucDanh.chi_tiet_dot_id);
        } catch { /* ignore */ }
        finally { setAddingCandidate(false); }
    };

    const handleStartVoting = async () => {
        const result = await startVotingProcess(Number(id));
        if (result.data.success) fetchDetail();
    };

    useEffect(() => {
        if (id) { fetchDetail(); fetchAllStaff(); }
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50">
            <Spin size="large" />
        </div>
    );
    if (!batchInfo) return (
        <div className="flex justify-center items-center min-h-screen text-red-500">Không tìm thấy dữ liệu</div>
    );

    const stateInfo = STATE_MAP[batchInfo.trang_thai];
    const stepIndex = STEP_INDEX[selectedChucDanh?.buoc_hien_tai ?? 2] ?? 0;
    const canStartVoting = batchInfo.trang_thai === 1;
    const canVote = [2, 3, 4, 5].includes(batchInfo.trang_thai)
        && selectedChucDanh !== null
        && [2, 3, 4, 5].includes(selectedChucDanh.buoc_hien_tai);

    const totalAllChucDanh = batchInfo.chuc_danh_list.reduce((sum, cd) => sum + Number(cd.so_ung_vien), 0);
    const validCandidates = candidates.filter(c => c.trang_thai === 1);
    const passedCandidates = candidates.filter(c => c.trang_thai === 3);
    const failedCandidates = candidates.filter(c => c.trang_thai === 2);
    const removedCandidates = candidates.filter(c => c.trang_thai === 0);

    const candidateColumns = [
        {
            title: "Viên chức",
            key: "vc",
            render: (_: unknown, r: UngVien) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <UserOutlined className="text-indigo-600 text-xs" />
                    </div>
                    <div>
                        <div className="font-semibold text-slate-800 text-sm">{r.ho_va_ten}</div>
                        <div className="text-xs text-slate-400">{r.ma_vien_chuc}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Đơn vị",
            dataIndex: "ten_don_vi",
            key: "ten_don_vi",
            render: (text: string) => (
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <HomeOutlined className="text-slate-300 text-xs" />
                    {text}
                </div>
            ),
        },
        {
            title: "Nguồn",
            dataIndex: "nguon_vien_chuc",
            key: "nguon_vien_chuc",
            width: 130,
            render: (text: string) => (
                <Tag color="geekblue" className="rounded-full px-3 text-xs border-0">{text}</Tag>
            ),
        },
        {
            title: "Chức vụ hiện tại",
            dataIndex: "ten_chuc_danh",
            key: "ten_chuc_danh",
            width: 160,
            render: (text: string) => text
                ? <Tag color="purple" className="rounded-full px-3 text-xs border-0">{text}</Tag>
                : <span className="text-slate-300 text-xs">—</span>,
        },
        {
            title: "Trạng thái",
            dataIndex: "trang_thai",
            key: "trang_thai",
            width: 110,
            render: (s: number) => {
                const info = CANDIDATE_STATUS[s];
                if (!info) return <Tag>?</Tag>;
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info.bg} ${info.text}`}>
                        {info.label}
                    </span>
                );
            },
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ── Sticky header ─────────────────────────── */}
            <div className="bg-white border-b border-slate-100 px-6 py-4 sticky top-14 z-30 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate("/dot-bo-nhiem")}
                            className="text-slate-500 hover:text-indigo-600 shrink-0"
                        />
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold text-slate-800 truncate m-0 leading-tight">
                                {batchInfo.ten_dot_bo_nhiem}
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-400">{batchInfo.ma_dot_bo_nhiem}</span>
                                <Badge status={stateInfo?.badgeStatus} text={
                                    <span className="text-xs text-slate-600">{stateInfo?.label}</span>
                                } />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {canStartVoting && selectedChucDanh && (
                            <>
                                <Select
                                    showSearch allowClear
                                    placeholder="Thêm ứng viên..."
                                    style={{ width: 220 }}
                                    value={selectedStaffId}
                                    onChange={setSelectedStaffId}
                                    optionFilterProp="label"
                                    size="middle"
                                    options={allStaff
                                        .filter(s => !candidates.some(c => c.vien_chuc_id === s.id))
                                        .map(s => ({ value: s.id, label: `${s.ma_vien_chuc ?? "—"} · ${s.ho_va_ten}` }))}
                                />
                                <Button
                                    icon={<PlusOutlined />}
                                    loading={addingCandidate}
                                    disabled={!selectedStaffId}
                                    onClick={handleAddCandidate}
                                >
                                    Thêm
                                </Button>
                            </>
                        )}
                        {canStartVoting && (
                            <Button
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                onClick={handleStartVoting}
                                disabled={totalAllChucDanh === 0}
                            >
                                Bắt đầu quy trình
                            </Button>
                        )}
                        {canVote && selectedChucDanh && (
                            <Button
                                type="primary"
                                icon={<FormOutlined />}
                                onClick={() => setVoteModalVisible(true)}
                            >
                                Ghi nhận kết quả
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-5">

                {/* ── Steps tracker ───────────────────────── */}
                <div className="bg-white rounded-xl px-6 py-5 shadow-sm border border-slate-100">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                        Tiến trình bổ nhiệm
                    </div>
                    <Steps
                        current={stepIndex}
                        status={batchInfo.trang_thai === 6 ? "finish" : batchInfo.trang_thai === 0 ? "error" : "process"}
                        items={STEP_ITEMS}
                        size="small"
                    />
                </div>

                {/* ── Info + Chức danh grid ─────────────── */}
                <div className="grid grid-cols-3 gap-5">

                    {/* Batch info */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 space-y-4">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Thông tin đợt
                        </div>
                        <InfoField label="Mã đợt"    value={batchInfo.ma_dot_bo_nhiem} />
                        <InfoField label="Tên đợt"   value={batchInfo.ten_dot_bo_nhiem} />
                        <InfoField label="Ngày bắt đầu" value={batchInfo.ngay_bat_dau ? new Date(batchInfo.ngay_bat_dau).toLocaleDateString("vi-VN") : null} />
                        <InfoField label="Ngày kết thúc" value={batchInfo.ngay_ket_thuc ? new Date(batchInfo.ngay_ket_thuc).toLocaleDateString("vi-VN") : null} />
                        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3">
                            <div className="text-center p-3 bg-indigo-50 rounded-lg">
                                <div className="text-xl font-bold text-indigo-600">{batchInfo.chuc_danh_list.length}</div>
                                <div className="text-xs text-slate-500 mt-0.5">Chức danh</div>
                            </div>
                            <div className="text-center p-3 bg-sky-50 rounded-lg">
                                <div className="text-xl font-bold text-sky-600">{totalAllChucDanh}</div>
                                <div className="text-xs text-slate-500 mt-0.5">Ứng viên</div>
                            </div>
                        </div>
                    </div>

                    {/* Chức danh list */}
                    <div className="col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                            Chức danh trong đợt — chọn để xem ứng viên
                        </div>
                        {batchInfo.chuc_danh_list.length === 0 ? (
                            <Empty description="Chưa có chức danh nào" className="py-8" />
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {batchInfo.chuc_danh_list.map(cd => {
                                    const isSelected = selectedChucDanh?.chi_tiet_dot_id === cd.chi_tiet_dot_id;
                                    const stepDot = cd.buoc_hien_tai === 6 ? "bg-emerald-400"
                                        : cd.buoc_hien_tai === 0 ? "bg-red-400"
                                        : cd.buoc_hien_tai != null ? "bg-indigo-400 animate-pulse"
                                        : "bg-slate-300";
                                    return (
                                        <div
                                            key={cd.chi_tiet_dot_id}
                                            onClick={() => { setSelectedChucDanh(cd); fetchCandidates(cd.chi_tiet_dot_id); }}
                                            className={`
                                                p-4 rounded-xl border-2 cursor-pointer transition-all
                                                ${isSelected
                                                    ? "border-indigo-500 bg-indigo-50/40 shadow-md shadow-indigo-100"
                                                    : "border-slate-100 hover:border-indigo-200 hover:shadow-sm"
                                                }
                                            `}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="font-semibold text-slate-800 text-sm leading-tight">{cd.ten_chuc_danh}</div>
                                                <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${stepDot}`} />
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                                                <HomeOutlined className="text-[10px]" />
                                                <span className="truncate">{cd.ten_don_vi}</span>
                                            </div>
                                            <div className="flex gap-1.5 flex-wrap">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-medium">
                                                    <TeamOutlined className="text-[10px]" />{cd.so_ung_vien}
                                                </span>
                                                <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                                                    Đề xuất {cd.so_luong_de_xuat}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Candidate table ─────────────────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                    {/* Section header */}
                    <div className="px-5 py-4 border-b border-slate-100">
                        {selectedChucDanh ? (
                            <div>
                                <div className="font-semibold text-slate-800">
                                    Ứng viên — <span className="text-indigo-600">{selectedChucDanh.ten_chuc_danh}</span>
                                </div>
                                <div className="text-xs text-slate-400 mt-0.5">{selectedChucDanh.ten_don_vi}</div>
                            </div>
                        ) : (
                            <div className="text-slate-400 text-sm">Chọn chức danh ở trên để xem ứng viên</div>
                        )}
                    </div>

                    {/* Candidate stats pills */}
                    {selectedChucDanh && (
                        <div className="px-5 py-3 border-b border-slate-50 flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                                Tổng {candidates.length}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                                <CheckCircleOutlined className="text-[10px]" /> Hợp lệ {validCandidates.length}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                                Đạt {passedCandidates.length}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium">
                                <CloseCircleOutlined className="text-[10px]" /> Không đạt {failedCandidates.length}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                                <StopOutlined className="text-[10px]" /> Bị loại {removedCandidates.length}
                            </span>
                        </div>
                    )}

                    {!selectedChucDanh ? (
                        <Empty description="Chọn một chức danh để xem danh sách ứng viên" className="py-16" />
                    ) : (
                        <Table
                            rowKey="chi_tiet_bn_id"
                            columns={candidateColumns}
                            dataSource={candidates}
                            loading={loadingCandidates}
                            rowClassName={r => r.trang_thai === 0 ? "opacity-40" : ""}
                            pagination={{
                                pageSize: 10,
                                showTotal: (total, range) => `${range[0]}–${range[1]} / ${total} ứng viên`,
                            }}
                        />
                    )}
                </div>
            </div>

            {selectedChucDanh && (
                <VoteModal
                    visible={voteModalVisible}
                    onCancel={() => setVoteModalVisible(false)}
                    onSuccess={async () => fetchDetail(selectedChucDanh.chi_tiet_dot_id)}
                    chiTietDotBoNhiemId={selectedChucDanh.chi_tiet_dot_id}
                    candidates={validCandidates}
                    currentStep={selectedChucDanh.buoc_hien_tai}
                />
            )}
        </div>
    );
};

export default AppointmentDetailView;
