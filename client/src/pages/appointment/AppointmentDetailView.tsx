import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { ChiTietBoNhiemReq } from "../../types/BoNhiem";
import axiosClient from "../../utils/AxiosClient";
import { Card, message, Spin, Steps, Table, Tag, Button, Alert, Descriptions, Badge } from "antd";
import { FileTextOutlined, FormOutlined } from "@ant-design/icons";
import VoteModal from "./VoteModal";
import PersonnelProposalModal from "./PersonnelProposalModal";

const STATE_MAP: Record<number, { label: string; color: string; badgeStatus: "default" | "warning" | "processing" | "success" | "error" }> = {
    1: { label: "Đang soạn thảo",               color: "default",    badgeStatus: "default" },
    2: { label: "Chờ hội nghị vòng 1",          color: "warning",    badgeStatus: "warning" },
    3: { label: "Chờ hội nghị vòng 2",          color: "processing", badgeStatus: "processing" },
    4: { label: "Chờ hội nghị cán bộ chủ chốt",   color: "processing", badgeStatus: "processing" },
    5: { label: "Chờ hội nghị vòng cuối",        color: "processing", badgeStatus: "processing" },
    6: { label: "Chờ xử lý hòa phiếu",           color: "warning",    badgeStatus: "warning" },
    7: { label: "Hoàn thành",                    color: "success",    badgeStatus: "success" },
    0: { label: "Đã hủy",                        color: "error",      badgeStatus: "error" },
};

// Map trang_thai → current step index (0-based)
const STEP_INDEX: Record<number, number> = {
    2: 0, 3: 1, 4: 2, 5: 3,
};

const STEP_ITEMS = [
    { title: "Vòng 1",      description: "Hội nghị tập thể lãnh đạo - Rà soát nguồn" },
    { title: "Vòng 2",      description: "Hội nghị tập thể lãnh đạo - Lấy phiếu giới thiệu" },
    { title: "Chốt",        description: "Hội nghị cán bộ chủ chốt - Lấy ý kiến tín nhiệm" },
    { title: "Vòng cuối",   description: "Hội nghị tập thể lãnh đạo - Biểu quyết" },
    { title: "Hoàn thành",  description: "Lập phương án nhân sự" },
];

const VOTE_STEP_LABEL: Record<number, string> = {
    3: "Hội nghị tập thể lãnh đạo (vòng 2) - Lấy phiếu giới thiệu",
    4: "Hội nghị cán bộ chủ chốt - Lấy ý kiến tín nhiệm",
    5: "Hội nghị tập thể lãnh đạo (vòng cuối) - Biểu quyết",
};

export const AppointmentDetailView: React.FC = () => {
    const { id } = useParams();
    const [data, setData] = useState<ChiTietBoNhiemReq | null>(null);
    const [loading, setLoading] = useState(true);
    const [voteModalVisible, setVoteModalVisible] = useState(false);
    const [proposalModalVisible, setProposalModalVisible] = useState(false);
    const [currentVotingStep, setCurrentVotingStep] = useState<number | null>(null);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const result = await axiosClient.get(`/appointments/${id}`);
            if (result.data.data) setData(result.data.data);
            else message.error("Không thể lấy dữ liệu đợt bổ nhiệm");
        } catch {
            message.error("Lỗi kết nối tới máy chủ");
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentStep = async () => {
        try {
            const result = await axiosClient.get(`/appointments/${id}/current-step`);
            setCurrentVotingStep(result.data.data.currentStep);
        } catch {
            // silent
        }
    };

    const handleVoteSuccess = () => {
        fetchDetail();
        fetchCurrentStep();
        message.success("Ghi nhận kết quả bỏ phiếu thành công!");
    };

    const handleProposalSuccess = () => {
        fetchDetail();
        message.success("Lập phương án nhân sự thành công!");
    };

    useEffect(() => {
        if (id) { fetchDetail(); fetchCurrentStep(); }
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
    );
    if (!data?.batchInfo) return (
        <div className="text-center mt-10 text-red-500">Không tìm thấy dữ liệu!</div>
    );

    const { batchInfo, candidates } = data;
    const trangThai = STATE_MAP[batchInfo.trang_thai];
    const stepIndex  = STEP_INDEX[batchInfo.trang_thai] ?? 0;

    // ── Button logic ───────────────────────────────────────────────────────────
    // Hiện nút bỏ phiếu ở bước 3, 4, 5
    const canVote     = [3, 4, 5].includes(batchInfo.trang_thai);
    // Hiện nút lập phương án khi hoàn thành (6)
    const canProposal = batchInfo.trang_thai === 6;

    const validCandidates   = candidates.filter(c => c.trang_thai === 1);
    const invalidCandidates = candidates.filter(c => c.trang_thai !== 1);

    const cols = [
        { title: "Mã viên chức",    dataIndex: "ma_vien_chuc",   key: "ma_vien_chuc" },
        { title: "Họ và tên",       dataIndex: "ho_va_ten",      key: "ho_va_ten" },
        { title: "Đơn vị",          dataIndex: "ten_don_vi",     key: "ten_don_vi" },
        { title: "Nguồn viên chức", dataIndex: "nguon_vien_chuc",key: "nguon_vien_chuc" },
        { title: "Chức vụ hiện tại",dataIndex: "ten_chuc_danh",  key: "ten_chuc_danh" },
        {
            title: "Trạng thái",
            dataIndex: "trang_thai",
            key: "trang_thai",
            render: (s: number) => (
                <Tag color={s === 1 ? "success" : "default"}>
                    {s === 1 ? "Hợp lệ" : "Đã loại"}
                </Tag>
            ),
        },
    ];

    return (
        <div className="p-6 space-y-6">

            {/* ── Thông tin đợt ── */}
            <Card title="Thông tin đợt bổ nhiệm">
                <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="Mã đợt">{batchInfo.ma_dot_bo_nhiem}</Descriptions.Item>
                    <Descriptions.Item label="Tên đợt">{batchInfo.ten_dot_bo_nhiem}</Descriptions.Item>
                    <Descriptions.Item label="Chức danh">{batchInfo.ten_chuc_danh}</Descriptions.Item>
                    <Descriptions.Item label="Đơn vị">{batchInfo.ten_don_vi}</Descriptions.Item>
                    <Descriptions.Item label="Số lượng đề xuất">{batchInfo.so_luong_de_xuat}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        {trangThai
                            ? <Badge status={trangThai.badgeStatus} text={<Tag color={trangThai.color}>{trangThai.label}</Tag>} />
                            : <Tag>Không xác định</Tag>
                        }
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* ── Alert theo trạng thái ── */}
            {canVote && (
                <Alert
                    type="info"
                    showIcon
                    message={`Đang thực hiện: ${VOTE_STEP_LABEL[batchInfo.trang_thai]}`}
                    description={
                        currentVotingStep
                            ? `Bước hiện tại: ${VOTE_STEP_LABEL[currentVotingStep]}`
                            : "Đang xác định bước tiếp theo..."
                    }
                />
            )}
            {batchInfo.trang_thai === 5 && (
                <Alert
                    type="info"
                    showIcon
                    message="Vote quyết định cuối"
                    description="Vote tất cả ứng viên tín nhiệm. Kết quả: >50% (trên tổng triệu tập) → DONE / tạo quyết định, không đạt → Step 7 (Dừng)."
                />
            )}
            {batchInfo.trang_thai === 6 && (
                <Alert
                    type="warning"
                    showIcon
                    message="Hòa phiếu — cần xử lý thủ công"
                    description="Có nhiều ứng viên bằng phiếu nhau ở vòng cuối. Vui lòng liên hệ ban tổ chức để xử lý."
                />
            )}

            <Card>
                <Steps
                    current={stepIndex}
                    status={batchInfo.trang_thai === 6 ? "error" : "process"}
                    items={STEP_ITEMS}
                />
            </Card>

            {/* ── Danh sách ứng viên ── */}
            <Card
                title="Danh sách ứng viên"
                extra={
                    <div className="flex gap-2">
                        {canVote && (
                            <Button
                                type="primary"
                                icon={<FormOutlined />}
                                onClick={() => setVoteModalVisible(true)}> Ghi nhận bỏ phiếu
                            </Button>
                        )}
                        {canProposal && (
                            <Button
                                type="primary"
                                icon={<FileTextOutlined />}
                                onClick={() => setProposalModalVisible(true)}
                            >
                                Lập phương án nhân sự
                            </Button>
                        )}
                    </div>
                }
            >
                <div className="mb-4 flex gap-3">
                    <Tag color="blue">Tổng: {candidates.length}</Tag>
                    <Tag color="green">Hợp lệ: {validCandidates.length}</Tag>
                    <Tag color="red">Bị loại: {invalidCandidates.length}</Tag>
                </div>

                <Table
                    rowKey="chi_tiet_bn_id"
                    columns={cols}
                    dataSource={candidates}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    rowClassName={(r) => r.trang_thai !== 1 ? "opacity-50" : ""}
                />
            </Card>

            {/* ── Modals ── */}
            <VoteModal
                visible={voteModalVisible}
                onCancel={() => setVoteModalVisible(false)}
                onSuccess={handleVoteSuccess}
                batchId={id!}
                candidates={validCandidates}   // chỉ truyền ứng viên hợp lệ
                currentStep={batchInfo.trang_thai}  // dùng trang_thai thay vì currentVotingStep
            />
            <PersonnelProposalModal
                visible={proposalModalVisible}
                onCancel={() => setProposalModalVisible(false)}
                onSuccess={handleProposalSuccess}
                batchId={id!}
                candidates={validCandidates}
            />
        </div>
    );
};

export default AppointmentDetailView;