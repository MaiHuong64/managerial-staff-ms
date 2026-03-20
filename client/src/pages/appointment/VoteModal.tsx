import type React from "react";
import { useState, useEffect, useMemo } from "react"; 
import axios from "axios";                             
import { Modal, Form, InputNumber, Button, Card, Table, Tag, Alert, message } from "antd";
import type { YeuCauGhiNhanPhieu, InputPhieuUngVien , KetQuaUngVien, ChiTietBoNhiem } from "../../types/BoNhiem";
import axiosClient from "../../utils/AxiosClient";

interface VoteFormValues {
    so_nguoi_trieu_tap: number;
    so_nguoi_co_mat: number;
    so_phieu_phat_ra: number;
    so_phieu_thu_ve: number;
    so_phieu_hop_le: number;
}

interface VoteModalProps {
    visible:    boolean;
    onCancel:   () => void;
    onSuccess:  () => void;
    batchId:    string;
    candidates: ChiTietBoNhiem[];
    currentStep?: number | null;
}

const STEP_NAMES: Record<number, string> = {
    3: "Hội nghị tập thể lãnh đạo (vòng 2) - Lấy phiếu giới thiệu",
    4: "Hội nghị cán bộ chủ chốt - Lấy ý kiến tín nhiệm",
    5: "Hội nghị tập thể lãnh đạo (vòng cuối) - Biểu quyết",
};

const REQUIRES_TWO_THIRDS = [3, 5];

export const VoteModal: React.FC<VoteModalProps> = ({
    visible, onCancel, onSuccess, batchId, candidates, currentStep
}) => {
    const [form] = Form.useForm<VoteFormValues>();
    const [loading, setLoading] = useState(false);
    const [candidateVotes, setCandidateVotes] = useState<InputPhieuUngVien[]>([]);
    const [soPhieuHopLe, setSoPhieuHopLe]    = useState<number | null>(null);
    const activeCandidates = useMemo(
        () => candidates.filter(c => c.trang_thai === 1),
        [candidates]
    );

    useEffect(() => {
        if (!visible) return;
        form.resetFields();
     
        setCandidateVotes(
            activeCandidates.map(c => ({
                chi_tiet_bn_id: c.chi_tiet_bn_id,
                so_phieu_dong_y: null,
                so_phieu_khong_dong_y: null,
            }))
        );
    }, [visible, activeCandidates, form]);

    const handleCandidateVoteChange = (
        id: number,
        field: keyof Omit<InputPhieuUngVien , "chi_tiet_bn_id">,
        value: number | null ) => { setCandidateVotes(prev => prev.map(v => v.chi_tiet_bn_id === id ? { ...v, [field]: value } : v));
    };
    const handleSubmit = async (values: VoteFormValues) => {
       if (currentStep && REQUIRES_TWO_THIRDS.includes(currentStep)) {
            const minCoMat = Math.ceil((2 / 3) * values.so_nguoi_trieu_tap);
            if (values.so_nguoi_co_mat < minCoMat) {
                message.error(
                    `Bước này cần ít nhất 2/3 số người triệu tập có mặt (tối thiểu ${minCoMat} người)`
                );
                return;
            }
        }

        const errors: string[] = [];
        if (values.so_nguoi_co_mat > values.so_nguoi_trieu_tap)
            errors.push("Số người có mặt không thể vượt quá số người triệu tập");
        if (values.so_phieu_phat_ra > values.so_nguoi_co_mat)
            errors.push("Số phiếu phát ra không thể vượt quá số người có mặt");
        if (values.so_phieu_thu_ve > values.so_phieu_phat_ra)
            errors.push("Số phiếu thu về không thể vượt quá số phiếu phát ra");
        if (values.so_phieu_hop_le > values.so_phieu_thu_ve)
            errors.push("Số phiếu hợp lệ không thể vượt quá số phiếu thu về");

        const incomplete = candidateVotes.filter(
            v => v.so_phieu_dong_y === undefined || v.so_phieu_dong_y === null ||
                 v.so_phieu_khong_dong_y === undefined || v.so_phieu_khong_dong_y === null
        );
        if (incomplete.length > 0)
            errors.push("Vui lòng nhập đầy đủ số phiếu cho tất cả ứng viên");

        if (errors.length > 0) {
            errors.forEach(e => message.error(e));
            return;
        }

        setLoading(true);
        try {
            //    Chỉ gửi so_phieu_dong_y và so_phieu_khong_dong_y
            const ket_qua_ung_vien: KetQuaUngVien[] = candidateVotes.map(v => ({
                chi_tiet_bn_id: v.chi_tiet_bn_id,
                so_phieu_dong_y: v.so_phieu_dong_y!,
                so_phieu_khong_dong_y: v.so_phieu_khong_dong_y!,
                ket_qua: 0
            }));

            const payload: YeuCauGhiNhanPhieu = {
                dot_bo_nhiem_id: parseInt(batchId),
                buoc_hoi_nghi: currentStep!,
                so_nguoi_trieu_tap: values.so_nguoi_trieu_tap,
                so_nguoi_co_mat: values.so_nguoi_co_mat,
                so_phieu_phat_ra: values.so_phieu_phat_ra,
                so_phieu_thu_ve: values.so_phieu_thu_ve,
                so_phieu_hop_le: values.so_phieu_hop_le,
                ket_qua_ung_vien,
            };

            await axiosClient.post(`/appointments/${batchId}/vote-results`, payload);
            message.success("Ghi nhận kết quả bỏ phiếu thành công!");
            onSuccess();
            handleCancel();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                message.error(error.response?.data?.message || "Lỗi khi ghi nhận kết quả bỏ phiếu");
            } else {
                message.error("Lỗi khi ghi nhận kết quả bỏ phiếu");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        
        setCandidateVotes([]);
        onCancel();
    };

    const candidateColumns = [
        { title: "Mã VC", dataIndex: "ma_vien_chuc", width: 100 },
        { title: "Họ và tên", dataIndex: "ho_va_ten", width: 180 },
        {
            title: "Phiếu đồng ý", key: "dong_y", width: 130,
            render: (_: unknown, record: ChiTietBoNhiem) => (
                <InputNumber
                    min={0} style={{ width: "100%" }}
                    value={candidateVotes.find(v => v.chi_tiet_bn_id === record.chi_tiet_bn_id)?.so_phieu_dong_y ?? undefined}
                    onChange={val => handleCandidateVoteChange(record.chi_tiet_bn_id, "so_phieu_dong_y", val)}/>
            ),
        },
        {
            title: "Phiếu không đồng ý", key: "khong_dong_y", width: 150,
            render: (_: unknown, record: ChiTietBoNhiem) => (
                <InputNumber
                    min={0} style={{ width: "100%" }}
                    value={candidateVotes.find(v => v.chi_tiet_bn_id === record.chi_tiet_bn_id)?.so_phieu_khong_dong_y ?? undefined}
                    onChange={val => handleCandidateVoteChange(record.chi_tiet_bn_id, "so_phieu_khong_dong_y", val)}
                />
            ),
        },
        {
            title: "Kết quả", key: "ket_qua", width: 110,
            render: (_: unknown, record: ChiTietBoNhiem) => {
                const v = candidateVotes.find(x => x.chi_tiet_bn_id === record.chi_tiet_bn_id);
                if (v?.so_phieu_dong_y == null || v?.so_phieu_khong_dong_y == null)
                    return <Tag>—</Tag>;
                const tong = v.so_phieu_dong_y + v.so_phieu_khong_dong_y;
                const ok = soPhieuHopLe !== null && tong === soPhieuHopLe;
                return <Tag color={ok ? "success" : "error"}>{tong}</Tag>;
            },
        },
        {
             title: "Tỉ lệ / kết quả", key: "ket_qua", width: 130,
            render: (_: unknown, record: ChiTietBoNhiem) => {
                const v = candidateVotes.find(x => x.chi_tiet_bn_id === record.chi_tiet_bn_id);
                if (v?.so_phieu_dong_y == null || !soPhieuHopLe)
                    return <Tag>Chưa tính</Tag>;
                const tiLe = v.so_phieu_dong_y / soPhieuHopLe;
                const dat  = tiLe > 0.5;
                return (
                    <Tag color={dat ? "success" : "error"}>
                        {Math.round(tiLe * 100)}% — {dat ? "Đạt" : "Không đạt"}
                    </Tag>
                );
            },
        }
    ];

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

                {/* ── Cảnh báo 2/3 ── */}
                {currentStep && REQUIRES_TWO_THIRDS.includes(currentStep) && (
                    <Alert type="warning" showIcon className="mb-4"
                        message={`Bước ${currentStep} yêu cầu ít nhất 2/3 số người triệu tập có mặt`}
                    />
                )}
                
                {/* ── Cảnh báo bước 4 ── */}
                {currentStep === 4 && (
                    <Alert type="info" showIcon className="mb-4"
                        message="Hội nghị cán bộ chủ chốt - Lấy ý kiến tín nhiệm"
                        description="Kết quả kiểm phiếu được ghi biên bản nhưng không công bố tại hội nghị này."
                    />
                )}

                {/* ── Thông tin hội nghị ── */}
                <Card
                    title={`Thông tin hội nghị${currentStep ? ` — ${STEP_NAMES[currentStep]}` : ""}`}
                    className="mb-4"
                >
                    <div className="grid grid-cols-3 gap-4">
                        {([
                            ["so_nguoi_trieu_tap", "Số người triệu tập"],
                            ["so_nguoi_co_mat", "Số người có mặt"   ],
                            ["so_phieu_phat_ra", "Số phiếu phát ra"  ],
                            ["so_phieu_thu_ve", "Số phiếu thu về"   ],
                            ["so_phieu_hop_le", "Số phiếu hợp lệ"   ],
                        ] as [string, string][]).map(([name, label]) => (
                            <Form.Item
                                key={name} label={label} name={name}
                                rules={[{ required: true, message: `Vui lòng nhập ${label.toLowerCase()}` }]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: "100%" }}
                                    onChange={name === "so_phieu_hop_le"
                                        ? (val) => setSoPhieuHopLe(val as number | null)
                                        : undefined
                                    }
                                />
                            </Form.Item>
                        ))}
                    </div>
                </Card>

                {/* ── Kết quả từng ứng viên ── */}
                <Card title="Kết quả từng ứng viên" className="mb-4">
                    {soPhieuHopLe !== null && (
                        <Alert
                            type="info" showIcon className="mb-3"
                            message={`Tổng phiếu đồng ý + không đồng ý của mỗi ứng viên phải = ${soPhieuHopLe} (số phiếu hợp lệ)`}
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

                <div className="flex justify-end gap-2">
                    <Button onClick={handleCancel}>Hủy</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        disabled={!currentStep}
                    >
                        Ghi nhận kết quả
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default VoteModal;