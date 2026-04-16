import type React from "react";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Modal, Form, InputNumber, Button, Card, Table, Tag, Alert, message } from "antd";
import { submitVote } from "../../api/dotBoNhiem.api";

interface VoteFormValues {
    so_nguoi_trieu_tap: number;
    so_nguoi_co_mat: number;
    so_phieu_phat_ra: number;
    so_phieu_thu_ve: number;
    so_phieu_hop_le: number;
}

interface CandidateVoteInput {
    chi_tiet_bn_id: number;
    so_phieu_dong_y: number | null;
    so_phieu_khong_dong_y: number | null;
}

interface VotePayload {
    chi_tiet_dot_bo_nhiem_id: number;
    buoc_hoi_nghi: number;
    so_nguoi_trieu_tap: number;
    so_nguoi_co_mat: number;
    so_phieu_phat_ra: number;
    so_phieu_thu_ve: number;
    so_phieu_hop_le: number;
    ket_qua_ung_vien: {
        chi_tiet_bn_id: number;
        so_phieu_dong_y: number;
        so_phieu_khong_dong_y: number;
    }[];
}

interface Candidate {
    chiTietBnId: number;
    maVienChuc: string;
    hoVaTen: string;
    trangThai: number;
}

interface VoteModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    chiTietDotBoNhiemId: number;
    candidates: Candidate[];
    currentStep?: number | null;
}
const STEP_NAMES: Record<number, string> = {
    2: "Hội nghị tập thể lãnh đạo (vòng 1) - Thảo luận",
    3: "Hội nghị tập thể lãnh đạo (vòng 2) - Lấy phiếu giới thiệu",
    4: "Hội nghị cán bộ chủ chốt - Lấy ý kiến tín nhiệm",
    5: "Hội nghị tập thể lãnh đạo (vòng cuối) - Biểu quyết",
};

// Bước cần 2/3 số người có mặt
const STEPS_REQUIRE_TWO_THIRDS = [3, 5];

// Bước cần nhập phiếu từng ứng viên
const STEPS_REQUIRE_VOTES = [3, 4, 5];

export const VoteModal: React.FC<VoteModalProps> = ({
    visible, onCancel, onSuccess,
    chiTietDotBoNhiemId, candidates, currentStep,
}) => {
    const [form] = Form.useForm<VoteFormValues>();
    const [loading, setLoading] = useState(false);
    const [candidateVotes, setCandidateVotes] = useState<CandidateVoteInput[]>([]);
    const [validBallots, setValidBallots] = useState<number | null>(null);

    const activeCandidates = useMemo(
        () => candidates.filter(c => c.trangThai === 1),
        [candidates]
    );

    // Reset form khi mở modal
    useEffect(() => {
        if (!visible) return;
        form.resetFields();
        setValidBallots(null);
        setCandidateVotes(
            activeCandidates.map(c => ({
                chi_tiet_bn_id: c.chiTietBnId,
                so_phieu_dong_y: null,
                so_phieu_khong_dong_y: null,
            }))
        );
    }, [visible, activeCandidates, form]);

    const handleCandidateVoteChange = (
        id: number,
        field: "so_phieu_dong_y" | "so_phieu_khong_dong_y",
        value: number | null
    ) => {
        setCandidateVotes(prev =>
            prev.map(v => v.chi_tiet_bn_id === id ? { ...v, [field]: value } : v)
        );
    };

    const handleSubmit = async (values: VoteFormValues) => {
        // Validate bước cần nhập phiếu ứng viên
        if (currentStep && STEPS_REQUIRE_VOTES.includes(currentStep)) {
            const incomplete = candidateVotes.filter(
                v => v.so_phieu_dong_y === null || v.so_phieu_khong_dong_y === null
            );
            if (incomplete.length > 0) {
                message.error("Vui lòng nhập đầy đủ số phiếu cho tất cả ứng viên");
                return;
            }
        }

        setLoading(true);
        try {
            const payload: VotePayload = {
                chi_tiet_dot_bo_nhiem_id: chiTietDotBoNhiemId,
                buoc_hoi_nghi: currentStep!,
                so_nguoi_trieu_tap: values.so_nguoi_trieu_tap,
                so_nguoi_co_mat: values.so_nguoi_co_mat,
                so_phieu_phat_ra: values.so_phieu_phat_ra ?? 0,
                so_phieu_thu_ve: values.so_phieu_thu_ve ?? 0,
                so_phieu_hop_le: values.so_phieu_hop_le ?? 0,
                ket_qua_ung_vien: candidateVotes.map(v => ({
                    chi_tiet_bn_id: v.chi_tiet_bn_id,
                    so_phieu_dong_y: v.so_phieu_dong_y ?? 0,
                    so_phieu_khong_dong_y: v.so_phieu_khong_dong_y ?? 0,
                })),
            };

            const res = await submitVote(payload);
            message.success(res.data.message ?? "Ghi nhận kết quả thành công!");
            onSuccess();
            handleCancel();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                message.error(error.response?.data?.message ?? "Lỗi khi ghi nhận kết quả");
            } else {
                message.error("Lỗi khi ghi nhận kết quả");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setCandidateVotes([]);
        setValidBallots(null);
        onCancel();
    };

    const candidateColumns = [
        { title: "Mã VC", dataIndex: "ma_vien_chuc", width: 100 },
        { title: "Họ và tên", dataIndex: "ho_va_ten", width: 180 },
        {
            title: "Phiếu đồng ý", key: "dong_y", width: 140,
            render: (_: unknown, record: Candidate) => (
                <InputNumber
                    min={0} style={{ width: "100%" }}
                    value={candidateVotes.find(v => v.chi_tiet_bn_id === record.chiTietBnId)?.so_phieu_dong_y ?? undefined}
                    onChange={val => handleCandidateVoteChange(record.chiTietBnId, "so_phieu_dong_y", val)}
                />
            ),
        },
        {
            title: "Phiếu không đồng ý", key: "khong_dong_y", width: 160,
            render: (_: unknown, record: Candidate) => (
                <InputNumber
                    min={0} style={{ width: "100%" }}
                    value={candidateVotes.find(v => v.chi_tiet_bn_id === record.chiTietBnId)?.so_phieu_khong_dong_y ?? undefined}
                    onChange={val => handleCandidateVoteChange(record.chiTietBnId, "so_phieu_khong_dong_y", val)}
                />
            ),
        },
        {
            title: "Kiểm tra", key: "check", width: 110,
            render: (_: unknown, record: Candidate) => {
                const v = candidateVotes.find(x => x.chi_tiet_bn_id === record.chiTietBnId);
                if (v?.so_phieu_dong_y == null || v?.so_phieu_khong_dong_y == null)
                    return <Tag>—</Tag>;
                const total = v.so_phieu_dong_y + v.so_phieu_khong_dong_y;
                const matched = validBallots !== null && total === validBallots;
                return <Tag color={matched ? "success" : "error"}>{total} / {validBallots ?? "?"}</Tag>;
            },
        },
        {
            title: "Tỉ lệ", key: "ti_le", width: 140,
            render: (_: unknown, record: Candidate) => {
                const v = candidateVotes.find(x => x.chi_tiet_bn_id === record.chiTietBnId);
                if (v?.so_phieu_dong_y == null || !validBallots)
                    return <Tag>—</Tag>;
                const ratio = v.so_phieu_dong_y / validBallots;
                const passed = ratio > 0.5;
                return (
                    <Tag color={passed ? "success" : "error"}>
                        {Math.round(ratio * 100)}% — {passed ? "Đạt" : "Không đạt"}
                    </Tag>
                );
            },
        },
    ];

    const needsVotes = currentStep && STEPS_REQUIRE_VOTES.includes(currentStep);
    const needsAttendance = currentStep && STEPS_REQUIRE_TWO_THIRDS.includes(currentStep);

    return (
        <Modal
            title="Ghi nhận kết quả bỏ phiếu"
            open={visible}
            onCancel={handleCancel}
            width={1050}
            footer={null}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>

                {/* Bước hiện tại */}
                <Card className="mb-4">
                    <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-600">Bước hiện tại:</span>
                        {currentStep
                            ? <Tag color="blue" className="text-base px-3 py-1">
                                Bước {currentStep}: {STEP_NAMES[currentStep] ?? "Không xác định"}
                              </Tag>
                            : <Tag color="red">Không xác định bước</Tag>
                        }
                    </div>
                </Card>

                {/* Cảnh báo 2/3 */}
                {needsAttendance && (
                    <Alert type="warning" showIcon className="mb-4"
                        message={`Bước này yêu cầu ít nhất 2/3 số người triệu tập có mặt`}
                    />
                )}

                {/* Cảnh báo bước 4 */}
                {currentStep === 4 && (
                    <Alert type="info" showIcon className="mb-4"
                        message="Kết quả kiểm phiếu được ghi biên bản nhưng không công bố tại hội nghị này."
                    />
                )}

                {/* Thông tin hội nghị — bước 2 chỉ nhập số người, không cần phiếu */}
                <Card
                    title={`Thông tin hội nghị${currentStep ? ` — ${STEP_NAMES[currentStep]}` : ""}`}
                    className="mb-4"
                >
                    {currentStep === 2 ? (
                        // Bước 2: chỉ cần số người
                        <div className="grid grid-cols-2 gap-4">
                            {([
                                ["so_nguoi_trieu_tap", "Số người triệu tập"],
                                ["so_nguoi_co_mat",    "Số người có mặt"   ],
                            ] as [string, string][]).map(([name, label]) => (
                                <Form.Item key={name} label={label} name={name}
                                    rules={[{ required: true, message: `Vui lòng nhập ${label.toLowerCase()}` }]}>
                                    <InputNumber min={0} style={{ width: "100%" }} />
                                </Form.Item>
                            ))}
                        </div>
                    ) : (
                        // Bước 3-5: cần đầy đủ thông tin phiếu
                        <div className="grid grid-cols-3 gap-4">
                            {([
                                ["so_nguoi_trieu_tap", "Số người triệu tập"],
                                ["so_nguoi_co_mat", "Số người có mặt"   ],
                                ["so_phieu_phat_ra", "Số phiếu phát ra"  ],
                                ["so_phieu_thu_ve", "Số phiếu thu về"   ],
                                ["so_phieu_hop_le", "Số phiếu hợp lệ"   ],
                            ] as [string, string][]).map(([name, label]) => (
                                <Form.Item key={name} label={label} name={name}
                                    rules={[{ required: true, message: `Vui lòng nhập ${label.toLowerCase()}` }]}>
                                    <InputNumber
                                        min={0} style={{ width: "100%" }}
                                        onChange={name === "so_phieu_hop_le"
                                            ? val => setValidBallots(val as number | null)
                                            : undefined
                                        }
                                    />
                                </Form.Item>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Bước 2: chỉ thông báo, không nhập phiếu ứng viên */}
                {currentStep === 2 && (
                    <Alert type="info" showIcon className="mb-4"
                        message="Hội nghị lãnh đạo vòng 1 - Thảo luận ghi biên bản"
                        description="Ghi nhận ý kiến, chọn ra ứng viên tiến hành bỏ phiếu ở bước tiếp theo."
                    />
                )}

                {/* Bước 3-5: nhập phiếu từng ứng viên */}
                {needsVotes && (
                    <Card title="Kết quả từng ứng viên" className="mb-4">
                        {validBallots !== null && (
                            <Alert type="info" showIcon className="mb-3"
                                message={`Tổng phiếu đồng ý + không đồng ý của mỗi ứng viên phải = ${validBallots}`}
                            />
                        )}
                        <Table
                            rowKey="chi_tiet_bn_id"
                            columns={candidateColumns}
                            dataSource={activeCandidates}
                            pagination={false}
                            size="small"
                            bordered
                        />
                    </Card>
                )}

                <div className="flex justify-end gap-2">
                    <Button onClick={handleCancel}>Hủy</Button>
                    <Button type="primary" htmlType="submit"
                        loading={loading} disabled={!currentStep}>
                        Ghi nhận kết quả
                    </Button>
                </div>

            </Form>
        </Modal>
    );
};

export default VoteModal;