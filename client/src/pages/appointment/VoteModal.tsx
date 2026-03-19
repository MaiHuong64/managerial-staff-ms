import type React from "react";
import { useState, useEffect, useMemo } from "react";  // ✅ thêm useMemo
import axios from "axios";                              // ✅ thêm axios
import { Modal, Form, InputNumber, Button, Card, Space, Table, Tag, Alert, message } from "antd";
import type { VoteResultRequest, CandidateVoteInput, KetQuaUngVien, ChiTietBoNhiem } from "../../types/BoNhiem";
import axiosClient from "../../utils/AxiosClient";

// ✅ Type cho form values thay vì any
interface VoteFormValues {
    so_nguoi_trieu_tap: number;
    so_nguoi_co_mat:    number;
    so_phieu_phat_ra:   number;
    so_phieu_thu_ve:    number;
    so_phieu_hop_le:    number;
}

interface VoteModalProps {
    visible:    boolean;
    onCancel:   () => void;
    onSuccess:  () => void;
    batchId:    string;
    candidates: ChiTietBoNhiem[];
}

const STEP_NAMES: Record<number, string> = {
    3: "Hội nghị tập thể lãnh đạo (vòng 2)",
    4: "Hội nghị cán bộ chủ chốt",
    5: "Hội nghị tập thể lãnh đạo (vòng cuối)",
};

const REQUIRES_TWO_THIRDS = [3, 5];

export const VoteModal: React.FC<VoteModalProps> = ({
    visible, onCancel, onSuccess, batchId, candidates
}) => {
    const [form] = Form.useForm<VoteFormValues>();
    const [loading, setLoading]               = useState(false);
    const [selectedStep, setSelectedStep]     = useState<number | null>(null);
    const [candidateVotes, setCandidateVotes] = useState<CandidateVoteInput[]>([]);

    // ✅ useMemo tránh recreate mỗi render
    const activeCandidates = useMemo(
        () => candidates.filter(c => c.trang_thai === 1),
        [candidates]
    );

    // ✅ deps đầy đủ
    useEffect(() => {
        if (!visible) return;
        form.resetFields();
        setSelectedStep(null);
        setCandidateVotes(
            activeCandidates.map(c => ({
                chi_tiet_bn_id:        c.chi_tiet_bn_id,
                so_phieu_dong_y:       null,
                so_phieu_khong_dong_y: null,
            }))
        );
    }, [visible, activeCandidates, form]);

    const handleCandidateVoteChange = (
        id: number,
        field: keyof Omit<CandidateVoteInput, "chi_tiet_bn_id">,
        value: number | null
    ) => {
        setCandidateVotes(prev =>
            prev.map(v => v.chi_tiet_bn_id === id ? { ...v, [field]: value } : v)
        );
    };

    // ✅ values có type rõ ràng
    const handleSubmit = async (values: VoteFormValues) => {
        if (!selectedStep) {
            message.error("Vui lòng chọn bước hội nghị");
            return;
        }

        if (REQUIRES_TWO_THIRDS.includes(selectedStep)) {
            const minCoMat = Math.ceil((2 / 3) * values.so_nguoi_trieu_tap);
            if (values.so_nguoi_co_mat < minCoMat) {
                message.error(`Bước ${selectedStep} cần ít nhất 2/3 số người triệu tập có mặt (tối thiểu ${minCoMat} người)`);
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
            v => v.so_phieu_dong_y === null || v.so_phieu_khong_dong_y === null
        );
        if (incomplete.length > 0)
            errors.push("Vui lòng nhập đầy đủ số phiếu cho tất cả ứng viên");

        if (errors.length > 0) {
            errors.forEach(e => message.error(e));
            return;
        }

        setLoading(true);
        try {
            const ket_qua_ung_vien: KetQuaUngVien[] = candidateVotes.map(v => ({
                chi_tiet_bn_id:        v.chi_tiet_bn_id,
                so_phieu_dong_y:       v.so_phieu_dong_y!,
                so_phieu_khong_dong_y: v.so_phieu_khong_dong_y!,
                ket_qua: v.so_phieu_dong_y! / values.so_nguoi_trieu_tap > 0.5 ? 1 : 0,
            }));

            const payload: VoteResultRequest = {
                buoc_hoi_nghi:      selectedStep,
                so_nguoi_trieu_tap: values.so_nguoi_trieu_tap,
                so_nguoi_co_mat:    values.so_nguoi_co_mat,
                so_phieu_phat_ra:   values.so_phieu_phat_ra,
                so_phieu_thu_ve:    values.so_phieu_thu_ve,
                so_phieu_hop_le:    values.so_phieu_hop_le,
                ket_qua_ung_vien,
            };

            await axiosClient.post(`/appointments/${batchId}/vote-results`, payload);
            message.success("Ghi nhận kết quả bỏ phiếu thành công!");
            onSuccess();
            handleCancel();
        } catch (error) {
            // ✅ dùng axios.isAxiosError thay vì cast any
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
        setSelectedStep(null);
        setCandidateVotes([]);
        onCancel();
    };

    const candidateColumns = [
        { title: "Mã VC",     dataIndex: "ma_vien_chuc", width: 100 },
        { title: "Họ và tên", dataIndex: "ho_va_ten",    width: 180 },
        {
            title: "Phiếu đồng ý", key: "dong_y", width: 130,
            render: (_: unknown, record: ChiTietBoNhiem) => (
                <InputNumber
                    min={0} style={{ width: "100%" }}
                    value={candidateVotes.find(v => v.chi_tiet_bn_id === record.chi_tiet_bn_id)?.so_phieu_dong_y ?? undefined}
                    onChange={val => handleCandidateVoteChange(record.chi_tiet_bn_id, "so_phieu_dong_y", val)}
                />
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
                const soTrieuTap = form.getFieldValue("so_nguoi_trieu_tap");
                // ✅ check v?.so_phieu_dong_y == null (bắt cả null lẫn undefined)
                if (!selectedStep || v?.so_phieu_dong_y == null || !soTrieuTap)
                    return <Tag>Chưa tính</Tag>;
                const dat = v.so_phieu_dong_y / soTrieuTap > 0.5;
                return <Tag color={dat ? "success" : "error"}>{dat ? "Đạt" : "Không đạt"}</Tag>;
            },
        },
    ];

    return (
        <Modal
            title="Ghi nhận kết quả bỏ phiếu"
            open={visible}
            onCancel={handleCancel}
            width={1000}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Card title="Chọn bước hội nghị" className="mb-4">
                    <Space wrap>
                        {[3, 4, 5].map(step => (
                            <Button
                                key={step}
                                type={selectedStep === step ? "primary" : "default"}
                                onClick={() => { setSelectedStep(step); form.resetFields(); }}
                            >
                                Bước {step}: {STEP_NAMES[step]}
                            </Button>
                        ))}
                    </Space>
                </Card>

                {selectedStep === 4 && (
                    <Alert type="info" showIcon className="mb-4"
                        message="Bước 4 chỉ ghi nhận kết quả tín nhiệm, không thay đổi trạng thái ứng viên" />
                )}

                {selectedStep && REQUIRES_TWO_THIRDS.includes(selectedStep) && (
                    <Alert type="warning" showIcon className="mb-4"
                        message={`Bước ${selectedStep} yêu cầu ít nhất 2/3 số người triệu tập có mặt`} />
                )}

                {selectedStep && (
                    <>
                        <Card title={`Thông tin hội nghị — ${STEP_NAMES[selectedStep]}`} className="mb-4">
                            <div className="grid grid-cols-3 gap-4">
                                {([
                                    ["so_nguoi_trieu_tap", "Số người triệu tập"],
                                    ["so_nguoi_co_mat",    "Số người có mặt"   ],
                                    ["so_phieu_phat_ra",   "Số phiếu phát ra"  ],
                                    ["so_phieu_thu_ve",    "Số phiếu thu về"   ],
                                    ["so_phieu_hop_le",    "Số phiếu hợp lệ"   ],
                                ] as [string, string][]).map(([name, label]) => (
                                    <Form.Item key={name} label={label} name={name}
                                        rules={[{ required: true, message: `Nhập ${label.toLowerCase()}!` }]}>
                                        <InputNumber min={0} style={{ width: "100%" }} />
                                    </Form.Item>
                                ))}
                            </div>
                        </Card>

                        <Card title="Kết quả từng ứng viên" className="mb-4">
                            <Table
                                rowKey="chi_tiet_bn_id"
                                columns={candidateColumns}
                                dataSource={activeCandidates}
                                pagination={false}
                                size="small"
                                bordered
                            />
                        </Card>
                    </>
                )}

                <div className="flex justify-end gap-2">
                    <Button onClick={handleCancel}>Hủy</Button>
                    <Button type="primary" htmlType="submit"
                        loading={loading} disabled={!selectedStep}>
                        Ghi nhận kết quả
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default VoteModal;