import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../utils/AxiosClient";
import { Card, message, Spin, Steps, Table, Tag, Button, Alert, Row, Col, Statistic, Progress, Avatar, Empty, Select} from "antd";
import {  FormOutlined, PlayCircleOutlined, UserOutlined, HomeOutlined, CheckCircleOutlined, ExclamationCircleOutlined,FileTextOutlined, TeamOutlined, PlusOutlined
} from "@ant-design/icons";
import VoteModal from "./VoteModal";
import type { ChucDanh, DotBoNhiem, UngVien } from "../../types/ChiTietBoNhiem";

const STATE_MAP: Record<number, { label: string; color: string; badgeStatus: "default" | "warning" | "processing" | "success" | "error" }> = {
    0: { label: "Đã dừng", color: "error", badgeStatus: "error" },
    1: { label: "Đang soạn thảo", color: "default", badgeStatus: "default" },
    2: { label: "Hội nghị lãnh đạo (vòng 1)", color: "processing", badgeStatus: "processing" },
    3: { label: "Hội nghị lãnh đạo (vòng 2)", color: "processing", badgeStatus: "processing" },
    4: { label: "Hội nghị cán bộ chủ chốt", color: "processing", badgeStatus: "processing" },
    5: { label: "Hội nghị lãnh đạo (vòng cuối)", color: "processing", badgeStatus: "processing" },
    6: { label: "Hoàn thành", color: "success", badgeStatus: "success" },
};

const STEP_INDEX: Record<number, number> = {
    2: 0, 3: 1, 4: 2, 5: 3, 6: 4,
};

const STEP_ITEMS = [
    { title: "Bước 1", description: "Hội nghị tập thể lãnh đạo (vòng 1)" },
    { title: "Bước 2", description: "Hội nghị tập thể lãnh đạo (vòng 2)" },
    { title: "Bước 3", description: "Hội nghị cán bộ chủ chốt" },
    { title: "Bước 4", description: "Hội nghị tập thể lãnh đạo (vòng cuối)" },
    { title: "Hoàn thành", description: "Quy trình bổ nhiệm hoàn tất" },
];

const VOTE_STEP_LABEL: Record<number, string> = {
    2: "Hội nghị tập thể lãnh đạo (vòng 1) - Thảo luận và đề xuất danh sách",
    3: "Hội nghị tập thể lãnh đạo (vòng 2) - Lấy phiếu giới thiệu",
    4: "Hội nghị cán bộ chủ chốt - Lấy ý kiến tín nhiệm",
    5: "Hội nghị tập thể lãnh đạo (vòng cuối) - Biểu quyết cuối cùng",
};
export const AppointmentDetailView: React.FC = () => {
    const { id } = useParams();
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
            const res = await axiosClient.get("/staffs");
            setAllStaff(res.data?.data ?? res.data ?? []);
        } catch {
            // silently fail — not critical
        }
    };

    const handleAddCandidate = async () => {
        if (!selectedStaffId || !selectedChucDanh) return;
        try {
            setAddingCandidate(true);
            await axiosClient.post(`/appointments/${selectedChucDanh.chi_tiet_dot_id}/candidates`, {
                vien_chuc_id: selectedStaffId,
                ly_do_vao: "Nguồn bên ngoài",
                chi_tiet_qh_id: null,
            });
            message.success("Đã thêm ứng viên thành công");
            setSelectedStaffId(null);
            fetchCandidates(selectedChucDanh.chi_tiet_dot_id);
            fetchDetail(selectedChucDanh.chi_tiet_dot_id);
        } catch (err: any) {
            message.error(err?.response?.data?.message ?? "Không thể thêm ứng viên");
        } finally {
            setAddingCandidate(false);
        }
    };

    const fetchDetail = async (keepSelectedPositonId?: number) => {
        try {
            setLoading(true);
            const result = await axiosClient.get(`/appointments/${id}`);
            const batch: DotBoNhiem = result.data.data;
            // console.log(batch);
            setBatchInfo(batch);
            // Auto-chọn chức danh đầu tiên nếu có
            if (batch.chuc_danh_list?.length > 0) {
            // Giữ lại chức danh đang chọn nếu có, không thì lấy đầu tiên
            const target = keepSelectedPositonId
                ? batch.chuc_danh_list.find(cd => cd.chi_tiet_dot_id === keepSelectedPositonId)
                : null;
            const selected = target ?? batch.chuc_danh_list[0];
            setSelectedChucDanh(selected);
            fetchCandidates(selected.chi_tiet_dot_id);
        }
        } catch {
            message.error("Lỗi kết nối tới máy chủ");
        } finally {
            setLoading(false);
        }
    };
 
    const fetchCandidates = async (chiTietDotId: number) => {
        //  console.log("fetchCandidates chiTietDotId:", chiTietDotId);
        try {
            setLoadingCandidates(true);
            const result = await axiosClient.get(`/appointments/detail/${chiTietDotId}/candidates`);
            setCandidates(result.data.data);
        } catch {
            message.error("Không thể tải danh sách ứng viên");
        } finally {
            setLoadingCandidates(false);
        }
    };
 
    const handleSelectChucDanh = (cd: ChucDanh) => {
        setSelectedChucDanh(cd);
        fetchCandidates(cd.chi_tiet_dot_id);
    };
 
    const handleStartVoting = async () => {
        try {
            const result = await axiosClient.post(`/appointments/${id}/start-voting`);
            if (result.data.success) {
                message.success(result.data.message);
                fetchDetail();
            }
        } catch {
            message.error("Không thể bắt đầu quy trình bỏ phiếu");
        }
    };
 
    const handleVoteSuccess = async () => {
        await fetchDetail(selectedChucDanh?.chi_tiet_dot_id);
    };
 
    useEffect(() => {
        if (id) {
            fetchDetail();
            fetchAllStaff();
        }
    }, [id]);
 
    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
    );
    if (!batchInfo) return (
        <div className="text-center mt-10 text-red-500">Không tìm thấy dữ liệu!</div>
    );

    const trangThaiInfo = STATE_MAP[batchInfo.trang_thai];
    const stepIndex = STEP_INDEX[selectedChucDanh?.buoc_hien_tai ?? 2] ?? 0;
    const canStartVoting = batchInfo.trang_thai === 1;
    const canVote = [2, 3, 4, 5].includes(batchInfo.trang_thai) && selectedChucDanh !== null && [2, 3, 4, 5].includes(selectedChucDanh.buoc_hien_tai);
 
    const validCandidates   = candidates.filter(c => c.trang_thai === 1);
    const passedCandidates  = candidates.filter(c => c.trang_thai === 3);
    const failedCandidates  = candidates.filter(c => c.trang_thai === 2);
    const removedCandidates = candidates.filter(c => c.trang_thai === 0);
 
    // Tổng ứng viên toàn đợt
    const totalAllChucDanh = batchInfo.chuc_danh_list.reduce(
        (sum, cd) => sum + Number(cd.so_ung_vien), 0
    );
 
    const cols = [
        {
            title: "Mã VC", dataIndex: "ma_vien_chuc", key: "ma_vien_chuc", width: 110,
            render: (text: string) => (
                <div className="flex items-center space-x-2">
                    <Avatar size="small" icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
                    <span className="font-medium">{text}</span>
                </div>
            ),
        },
        {
            title: "Họ và tên", dataIndex: "ho_va_ten", key: "ho_va_ten",
            render: (text: string) => <span className="font-semibold">{text}</span>,
        },
        {
            title: "Đơn vị", dataIndex: "ten_don_vi", key: "ten_don_vi",
            render: (text: string) => (
                <div className="flex items-center space-x-1">
                    <HomeOutlined className="text-gray-400" />
                    <span>{text}</span>
                </div>
            ),
        },
        {
            title: "Nguồn", dataIndex: "nguon_vien_chuc", key: "nguon_vien_chuc",
            render: (text: string) => <Tag color="geekblue">{text}</Tag>,
        },
        {
            title: "Chức vụ hiện tại", dataIndex: "ten_chuc_danh", key: "ten_chuc_danh",
            render: (text: string) => <Tag color="purple">{text ?? "—"}</Tag>,
        },
        {
            title: "Trạng thái", dataIndex: "trang_thai", key: "trang_thai",
            render: (s: number) => {
                const map: Record<number, { color: string; text: string }> = {
                    0: { color: "default", text: "Đã loại" },
                    1: { color: "success", text: "Hợp lệ" },
                    2: { color: "error", text: "Không đạt" },
                    3: { color: "processing", text: "Đạt" },
                };
                const info = map[s] ?? { color: "default", text: "?" };
                return <Tag color={info.color}>{info.text}</Tag>;
            },
        },
    ];
 
    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-5">
 
            {/* Thống kê tổng đợt */}
            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic title="Chức danh trong đợt"
                            value={batchInfo.chuc_danh_list.length}
                            valueStyle={{ color: "#1890ff" }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Tổng ứng viên"
                            value={totalAllChucDanh}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: "#1890ff" }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Đạt (chức danh đang xem)"
                            value={passedCandidates.length}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: "#13c2c2" }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Không đạt (chức danh đang xem)"
                            value={failedCandidates.length}
                            prefix={<ExclamationCircleOutlined />}
                            valueStyle={{ color: "#ff4d4f" }} />
                    </Card>
                </Col>
            </Row>
 
            {/* Thông tin đợt */}
            <Card title={
                <div className="flex items-center space-x-2">
                    <FileTextOutlined className="text-blue-500" />
                    <span className="font-semibold">Thông tin đợt bổ nhiệm</span>
                </div>
            }>
                <Row gutter={16}>
                    <Col span={12}>
                        <div className="space-y-2">
                            <div><span className="text-gray-500">Mã đợt: </span>
                                <span className="font-semibold">{batchInfo.ma_dot_bo_nhiem}</span></div>
                            <div><span className="text-gray-500">Tên đợt: </span>
                                <span className="font-semibold">{batchInfo.ten_dot_bo_nhiem}</span></div>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div className="space-y-2">
                            <div><span className="text-gray-500">Trạng thái: </span>
                                <Tag color={trangThaiInfo?.color}>{trangThaiInfo?.label}</Tag>
                            </div>
                            <div><span className="text-gray-500">Ngày bắt đầu: </span>
                                <span>{batchInfo.ngay_bat_dau ?? "—"}</span></div>
                        </div>
                    </Col>
                </Row>
            </Card>
 
            {/* Chức danh trong đợt */}
            <Card title={
                <div className="flex items-center space-x-2">
                    <TeamOutlined className="text-blue-500" />
                    <span className="font-semibold">Chức danh trong đợt</span>
                </div>
            }>
                {batchInfo.chuc_danh_list.length === 0 ? (
                    <Empty description="Chưa có phiếu chủ trương nào được gắn vào đợt này" />
                ) : (
                    <div className="flex gap-3 flex-wrap">
                        {batchInfo.chuc_danh_list.map(cd => (
                            <Card
                                key={cd.chi_tiet_dot_id}
                                size="small"
                                hoverable
                                onClick={() => handleSelectChucDanh(cd)}
                                className={`cursor-pointer transition-all ${
                                    selectedChucDanh?.chi_tiet_dot_id === cd.chi_tiet_dot_id
                                        ? "border-2 border-blue-500 shadow-md"
                                        : "border border-gray-200"
                                }`}
                                style={{ minWidth: 200 }}
                            >
                                <div className="font-semibold text-gray-800">{cd.ten_chuc_danh}</div>
                                <div className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                                    <HomeOutlined /> {cd.ten_don_vi}
                                </div>
                                <div className="mt-2 flex gap-2">
                                    <Tag color="blue">{cd.so_ung_vien} ứng viên</Tag>
                                    <Tag color="orange">Đề xuất: {cd.so_luong_de_xuat}</Tag>
                                    <Tag color={cd.buoc_hien_tai === 6 ? "success" : cd.buoc_hien_tai === 0 ? "error" : "processing"}>
                                        {cd.buoc_hien_tai === 6 ? "Hoàn thành" 
                                        : cd.buoc_hien_tai === 0 ? "Dừng"
                                        : `Bước ${STEP_INDEX[cd.buoc_hien_tai] + 1}`}
                                    </Tag>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </Card>
 
            {/* Alert trạng thái */}
            {canStartVoting && (
                <Alert type="info" showIcon
                    message="Đang soạn thảo"
                    description="Kiểm tra danh sách ứng viên và nhấn 'Bắt đầu quy trình' khi đã sẵn sàng." />
            )}
            {canVote && selectedChucDanh && (
                <Alert message={`${selectedChucDanh.ten_chuc_danh}: ${VOTE_STEP_LABEL[selectedChucDanh.buoc_hien_tai]}`} />
            )}
            {batchInfo.trang_thai === 6 && (
                <Alert type="success" showIcon
                    message="Quy trình bổ nhiệm đã hoàn thành" />
            )}
            {batchInfo.trang_thai === 0 && (
                <Alert type="error" showIcon
                    message="Quy trình đã dừng do không đủ điều kiện" />
            )}
 
            {/* Steps */}
            <Card>
                <Steps
                    current={stepIndex}
                    status={batchInfo.trang_thai === 6 ? "finish" : batchInfo.trang_thai === 0 ? "error" : "process"}
                    items={STEP_ITEMS}
                    className="mb-3"
                />
                <Progress
                    percent={Math.round(((stepIndex + 1) / STEP_ITEMS.length) * 100)}
                    strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
                    showInfo={false}
                />
            </Card>
 
            {/* Danh sách ứng viên của chức danh đang chọn */}
            <Card
                title={
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <TeamOutlined className="text-blue-500" />
                            <span className="font-semibold">
                                Ứng viên
                                {selectedChucDanh && (
                                    <span className="text-gray-400 font-normal ml-2">
                                        — {selectedChucDanh.ten_chuc_danh} · {selectedChucDanh.ten_don_vi}
                                    </span>
                                )}
                            </span>
                        </div>
                        <div className="flex gap-2 items-center flex-wrap">
                            {canStartVoting && selectedChucDanh && (
                                <>
                                    <Select
                                        showSearch
                                        allowClear
                                        placeholder="Chọn viên chức để thêm..."
                                        style={{ minWidth: 240 }}
                                        value={selectedStaffId}
                                        onChange={setSelectedStaffId}
                                        optionFilterProp="label"
                                        options={allStaff
                                            .filter(s => !candidates.some(c => c.vien_chuc_id === s.id))
                                            .map(s => ({
                                                value: s.id,
                                                label: `${s.ma_vien_chuc ?? "—"} · ${s.ho_va_ten}`,
                                            }))}
                                    />
                                    <Button
                                        type="default"
                                        icon={<PlusOutlined />}
                                        loading={addingCandidate}
                                        disabled={!selectedStaffId}
                                        onClick={handleAddCandidate}
                                    >
                                        Thêm ứng viên
                                    </Button>
                                </>
                            )}
                            {canStartVoting && (
                                <Button type="primary" icon={<PlayCircleOutlined />}
                                    onClick={handleStartVoting}
                                    disabled={totalAllChucDanh === 0}>
                                    Bắt đầu quy trình
                                </Button>
                            )}
                            {canVote && selectedChucDanh && (
                                <Button type="primary" icon={<FormOutlined />}
                                    onClick={() => setVoteModalVisible(true)}>
                                    Ghi nhận kết quả
                                </Button>
                            )}
                        </div>
                    </div>
                }
            >
                {!selectedChucDanh ? (
                    <Empty description="Chọn một chức danh ở trên để xem danh sách ứng viên" />
                ) : (
                    <>
                        <div className="mb-3 flex flex-wrap gap-2">
                            <Tag color="blue">Tổng: {candidates.length}</Tag>
                            <Tag color="green">Hợp lệ: {validCandidates.length}</Tag>
                            <Tag color="cyan">Đạt: {passedCandidates.length}</Tag>
                            <Tag color="red">Không đạt: {failedCandidates.length}</Tag>
                            <Tag>Bị loại: {removedCandidates.length}</Tag>
                        </div>
                        <Table
                            rowKey="chi_tiet_bn_id"
                            columns={cols}
                            dataSource={candidates}
                            loading={loadingCandidates}
                            pagination={{
                                pageSize: 10,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} / ${total} ứng viên`,
                            }}
                            rowClassName={r => r.trang_thai === 0 ? "opacity-50" : ""}
                        />
                    </>
                )}
            </Card>
 
            {/* Vote Modal */}
            {selectedChucDanh && (
                <VoteModal
                    visible={voteModalVisible}
                    onCancel={() => setVoteModalVisible(false)}
                    onSuccess={handleVoteSuccess}
                    // batchId={id!}
                    chiTietDotBoNhiemId={selectedChucDanh.chi_tiet_dot_id}
                    candidates={validCandidates}
                    currentStep={selectedChucDanh.buoc_hien_tai}
                />
            )}
        </div>
    );
};
 
export default AppointmentDetailView;