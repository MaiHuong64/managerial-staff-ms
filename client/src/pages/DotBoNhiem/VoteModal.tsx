import type React from "react";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Modal, Form, InputNumber, Button, Card, Table, Tag, Alert, message, Radio } from "antd";
import { resolveVoteTie, submitVote } from "../../api/dotBoNhiem.api";

interface VoteFormValues {
    soNguoiTrieuTap: number;
    soNguoiCoMat: number;
    soPhieuPhatRa: number;
    soPhieuThuVe: number;
    soPhieuHopLe: number;
}
interface CandidateVoteInput {
    chiTietBnId: number;
    soPhieuDongY: number | null;
    // soPhieuKhongDongY: number | null;
}
interface VotePayload {
    chiTietDotBoNhiemId: number;
    buocHoiNghi: number;
    soNguoiTrieuTap: number;
    soNguoiCoMat: number;
    soPhieuPhatRa: number;
    soPhieuThuVe: number;
    soPhieuHopLe: number;
    ketQuaUngVien: {
        chiTietBnId: number;
        soPhieuDongY: number;
        soPhieuKhongDongY: number;
    }[];
}

interface CandidateInfo {
    chiTietBnId: number;
    maVienChuc: string;
    hoVaTen: string;
    trangThai: number;
}

interface TieCandidatesResult {
    chiTietBnId: number;
    soPhieuDongY: number;
}

interface VoteModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    chiTietDotBoNhiemId: number;
    candidates: CandidateInfo[];
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

export const VoteModal: React.FC<VoteModalProps> = ({visible, onCancel, onSuccess, chiTietDotBoNhiemId, candidates, currentStep }) => {
    const [form] = Form.useForm<VoteFormValues>();
    const [loading, setLoading] = useState(false);
    const [candidateVotes, setCandidateVotes] = useState<CandidateVoteInput[]>([]);
    const [tieCandidates, setTieCandidates] = useState<number[]>([]);
    const [selectedWinner, setSelectedWinner] = useState<number | null>(null);
    const [tieMode, setTieMode] = useState(false);
    const activeCandidates = useMemo(() => candidates.filter(c => c.trangThai === 1),[candidates]);

    const values = Form.useWatch([], form);
    const soPhieuHopLe = values?.soPhieuHopLe ?? 0;

    // Reset form khi mở modal
    useEffect(() => {
        if (!visible) return;
        form.resetFields();
        setCandidateVotes(
            activeCandidates.map(c => ({
                chiTietBnId: c.chiTietBnId,
                soPhieuDongY: null,
                // soPhieuKhongDongY: null,
            }))
        );
    }, [visible, activeCandidates, form]);

    const handleCandidateVoteChange = ( id: number, soPhieuDongY: number | null) => {
        setCandidateVotes(prev =>
            prev.map(v => v.chiTietBnId === id ? { ...v, soPhieuDongY } : v)
        );
    };

    const handleSubmit = async (values: VoteFormValues) => {
        // Validate bước cần nhập phiếu ứng viên
        if (currentStep && STEPS_REQUIRE_VOTES.includes(currentStep)) {
           const isComplete = candidateVotes.filter(v => v.soPhieuDongY != null);
            if (isComplete.length !== candidateVotes.length) {
                message.error("Vui lòng nhập đầy đủ số phiếu cho tất cả ứng viên");
                return;
            }
        }

        setLoading(true);
        try {
            const payload: VotePayload = {
                chiTietDotBoNhiemId: chiTietDotBoNhiemId,
                buocHoiNghi: currentStep!,
                soNguoiTrieuTap: values.soNguoiTrieuTap,
                soNguoiCoMat: values.soNguoiCoMat,
                soPhieuPhatRa: values.soPhieuPhatRa ?? 0,
                soPhieuThuVe: values.soPhieuThuVe ?? 0,
                soPhieuHopLe: values.soPhieuHopLe ?? 0,
                ketQuaUngVien: candidateVotes.map(v => ({
                    chiTietBnId: v.chiTietBnId,
                    soPhieuDongY: v.soPhieuDongY ?? 0,
                    soPhieuKhongDongY: values.soPhieuHopLe - (v.soPhieuDongY ?? 0),
                })),
            };

            const res = await submitVote(payload);

            if(res.data.hoa){
                setTieMode(true);
                message.warning("Có ứng viên hòa, vui lòng chọn ứng viên được đi tiếp!");
                setTieCandidates(res.data.tieCandidates.map((c: TieCandidatesResult) => c.chiTietBnId));
                return;
            }
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
        setTieMode(false);
        setTieCandidates([]);
        setSelectedWinner(null);
        onCancel();
    };

    const handleTieBreak = async () => {
        if(!selectedWinner){
            message.error("Vui lòng chọn ứng viên được đi tiếp!");
            return;
        }
        setLoading(true);
        try {
            await resolveVoteTie(chiTietDotBoNhiemId, selectedWinner, tieCandidates);
            message.success("Đã cập nhật kết quả ứng viên hòa!");
            setTieMode(false);
            setSelectedWinner(null);
            setTieCandidates([]);
            onSuccess();
            handleCancel();
        } catch (error: any) {
           message.error(error?.response?.data?.message ?? "Lỗi khi xác nhận");
        } finally {
            setLoading(false);
        }
    }

    const candidateColumns = [
        { title: "Mã VC", dataIndex: "maVienChuc", width: 100 },
        { title: "Họ và tên", dataIndex: "hoVaTen", width: 180 },
        {
            title: "Phiếu đồng ý", key: "dongY", width: 140,
            render: (_: unknown, record: CandidateInfo) => (
                <InputNumber
                    min={0} style={{ width: "100%" }}
                    disabled={tieMode}
                    value={candidateVotes.find(v => v.chiTietBnId === record.chiTietBnId)?.soPhieuDongY ?? undefined}
                    onChange={val => handleCandidateVoteChange(record.chiTietBnId, val)}
                />
            ),
        },
        {
            title: "Phiếu không đồng ý", key: "khong_dong_y", width: 160,
            render: (_: unknown, record: CandidateInfo) => {
                const vote = candidateVotes.find(v => v.chiTietBnId === record.chiTietBnId);
                const kdy = vote?.soPhieuDongY != null ? soPhieuHopLe - vote.soPhieuDongY : null;
                return (
                    <span className={kdy !== null && kdy < 0 ? "text-red-500 font-medium" : "text-slate-700"}>
                        {kdy ?? 0   }
                    </span>
                );
            },
        },
        {
            title: "Kiểm tra", key: "check", width: 110,
            render: (_: unknown, record: CandidateInfo) => {
                const v = candidateVotes.find(x => x.chiTietBnId === record.chiTietBnId);
                const dy = v?.soPhieuDongY;
                const kdy = dy != null && soPhieuHopLe - dy >= 0 ? soPhieuHopLe - dy : null;
                const isMatch = soPhieuHopLe > 0 && dy != null && kdy != null && dy + kdy === soPhieuHopLe;
                return <Tag color={isMatch ? "success" : "error"}>{dy} / {soPhieuHopLe}</Tag>
            },
        },
        {
            title: "Tỉ lệ", key: "tiLe", width: 140,
            render: (_: unknown, record: CandidateInfo) => {
                const v = candidateVotes.find(x => x.chiTietBnId === record.chiTietBnId);
                if (v?.soPhieuDongY == null || soPhieuHopLe === 0) return <Tag> 0 </Tag>;
                const ratio = v.soPhieuDongY / soPhieuHopLe;;
                const passed = ratio > 0.5;
                return (
                    <Tag color={passed ? "success" : "error"}>
                        {Math.round(ratio * 100)}% — {passed ? "Đạt" : "Không đạt"}
                    </Tag>
                );
            },
        },
        {
            title: tieMode ? "Chọn ứng viên" : "",
            key: "tieBreak",
            width: 120,
            render: (_: unknown, record: CandidateInfo) => {
                // console.log("Rendering tieBreak column:", { tieMode, tieCandidates, recordId: record.chiTietBnId });
                if (!tieMode || !tieCandidates.includes(record.chiTietBnId)) {
                    return null;
                }
                return (
                    <Radio
                        checked={selectedWinner === record.chiTietBnId}
                        onChange={() => setSelectedWinner(record.chiTietBnId)}
                    />
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

                {/* Cảnh báo hòa phiếu */}
                {tieMode && (
                    <Alert type="warning" showIcon className="mb-4"
                        message="Phát hiện hòa phiếu"
                        description="Vui lòng chọn ứng viên được đi tiếp bước tiếp theo bằng cách click vào Radio ở cột cuối bảng."
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
                                ["soNguoiTrieuTap", "Số người triệu tập"],
                                ["soNguoiCoMat",    "Số người có mặt"   ],
                            ] as [string, string][]).map(([name, label]) => (
                                <Form.Item key={name} label={label} name={name}
                                    rules={[{ required: true, message: `Vui lòng nhập ${label.toLowerCase()}` }]}>
                                    <InputNumber min={0} style={{ width: "100%" }} />
                                </Form.Item>
                            ))}
                        </div>
                    ) : (
                        // Bước 3-5: cần đầy đủ thông tin phiếu
                        <div className="grid grid-cols-5 gap-4 content-center">
                            {([
                                ["soNguoiTrieuTap", "Số người triệu tập"],
                                ["soNguoiCoMat", "Số người có mặt"   ],
                                ["soPhieuPhatRa", "Số phiếu phát ra"  ],
                                ["soPhieuThuVe", "Số phiếu thu về"   ],
                                ["soPhieuHopLe", "Số phiếu hợp lệ"  ],
                            ] as [string, string][]).map(([name, label]) => (
                                <Form.Item key={name} label={label} name={name}
                                    rules={[{ required: true, message: `Vui lòng nhập ${label.toLowerCase()}` }]}>
                                    <InputNumber min={0} style={{ width: "100%" }}/>
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
            
                        <Table
                            rowKey="chiTietBnId"
                            columns={candidateColumns}
                            dataSource={activeCandidates}
                            pagination={false}
                            size="small"
                            bordered
                            rowClassName={(record) => tieCandidates?.includes(record.chiTietBnId) ?
                                (selectedWinner === record.chiTietBnId ? "bg-green-50" : "bg-red-50") : ""
                            }
                        />
                    </Card>
                )}

                <div className="flex justify-end gap-2">
                    <Button onClick={handleCancel}>Hủy</Button>
                    {tieMode ? (
                        <Button type="primary" onClick={handleTieBreak} loading={loading}>
                            Xác nhận quyết định
                        </Button>
                    ) : (
                        <Button type="primary" htmlType="submit" loading={loading} disabled={!currentStep}>
                            Ghi nhận kết quả
                        </Button>
                    )}
                </div>
                {/* {tieMode && tieCandidates && (
                    <Radio.Group onChange={e => setSelectedWinner(e.target.value)} value={selectedWinner} className="mt-4">
                        <div className="flex flex-col gap-2">
                            <span className="font-medium">Có ứng viên hòa, vui lòng chọn ứng viên được đi tiếp:</span>  
                            {activeCandidates.filter(c => tieCandidates.includes(c.chiTietBnId)).map(c => (
                                <Radio key={c.chiTietBnId} value={c.chiTietBnId}>
                                    {c.hoVaTen} ({c.maVienChuc})    
                                </Radio>
                            ))}
                        </div>
                    </Radio.Group>
                )} */}
            </Form>
        </Modal>
    );
};

export default VoteModal;