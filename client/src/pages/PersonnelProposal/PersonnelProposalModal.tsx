import type React from "react";
import { useState, useEffect } from "react";
import { Modal, Form, Input, DatePicker, Button, Card, Table, Select, message, Checkbox, Space, Divider, Tag } from "antd";
import dayjs from "dayjs";
import type { ChiTietBoNhiem, DotBoNhiem } from "../../types/BoNhiem";
import axiosClient from "../../utils/AxiosClient";

interface PersonnelProposalModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    availableBatches?: DotBoNhiem[];
    editingProposal?: any;
}

interface ProposalCandidate {
    chi_tiet_bn_id: number;
    loai_phuong_an: string;
    ghi_chu: string;
    batch_id: number;
    ten_dot_bo_nhiem: string;
}

interface BatchSelection {
    batch_id: number;
    ten_dot_bo_nhiem: string;
    selected: boolean;
    candidates: ChiTietBoNhiem[];
}

const { TextArea } = Input;
const { Option } = Select;

export const PersonnelProposalModal: React.FC<PersonnelProposalModalProps> = ({
    visible,
    onCancel,
    onSuccess,
    availableBatches,
    editingProposal
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [proposalCandidates, setProposalCandidates] = useState<ProposalCandidate[]>([]);
    const [selectedBatches, setSelectedBatches] = useState<BatchSelection[]>([]);
    const [aggregationMode, setAggregationMode] = useState(false);

    useEffect(() => {
        if (visible && availableBatches) {
            const batchSelections: BatchSelection[] = availableBatches.map(batch => ({
                batch_id: batch.id,
                ten_dot_bo_nhiem: batch.ten_dot_bo_nhiem,
                selected: false,
                candidates: []
            }));
            setSelectedBatches(batchSelections);
        }
    }, [visible, availableBatches]);

    useEffect(() => {
        if (visible && editingProposal) {
            form.setFieldsValue({
                so_to_trinh: editingProposal.so_to_trinh,
                ngay_to_trinh: dayjs(editingProposal.ngay_to_trinh),
                ghi_chu: editingProposal.ghi_chu
            });
        } else if (visible) {
            form.resetFields();
            form.setFieldsValue({
                ngay_to_trinh: dayjs()
            });
        }
    }, [visible, editingProposal, form]);

    const handleBatchSelection = async (batchId: number, selected: boolean) => {
        setSelectedBatches(prev => prev.map(batch => 
            batch.batch_id === batchId 
                ? { ...batch, selected }
                : batch
        ));

        if (selected) {
            try {
                const response = await axiosClient.get(`/appointments/${batchId}/candidates`);
                if (response.data.success) {
                    const candidates = response.data.data.filter((c: ChiTietBoNhiem) => c.trang_thai === 3);
                    setSelectedBatches(prev => prev.map(batch => 
                        batch.batch_id === batchId 
                            ? { ...batch, candidates }
                            : batch
                    ));
                }
            } catch (error) {
                message.error("Không thể tải danh sách ứng viên của đợt này");
            }
        }
    };

    const handleAggregateCandidates = () => {
        const allCandidates: ProposalCandidate[] = [];
        selectedBatches.forEach(batch => {
            if (batch.selected && batch.candidates.length > 0) {
                batch.candidates.forEach(candidate => {
                    allCandidates.push({
                        chi_tiet_bn_id: candidate.chi_tiet_bn_id,
                        loai_phuong_an: "",
                        ghi_chu: "",
                        batch_id: batch.batch_id,
                        ten_dot_bo_nhiem: batch.ten_dot_bo_nhiem
                    });
                });
            }
        });
        setProposalCandidates(allCandidates);
    };

    const selectedCount = selectedBatches.filter(b => b.selected).length;
    const totalCandidates = selectedBatches.reduce((sum, batch) => sum + batch.candidates.length, 0);
    const allSelected = selectedBatches.length > 0 && selectedBatches.every(b => b.selected);

    const handleSelectAllBatches = () => {
        setSelectedBatches(prev => prev.map(batch => ({ ...batch, selected: true })));
    };

    const handleDeselectAllBatches = () => {
        setSelectedBatches(prev => prev.map(batch => ({ ...batch, selected: false })));
    };

    const handleSubmit = async (values: any) => {
        const candidatesToProcess = proposalCandidates;
        
        const invalidCandidates = candidatesToProcess.filter(pc => !pc.loai_phuong_an);
        if (invalidCandidates.length > 0) {
            message.error("Vui lòng chọn loại phương án cho tất cả ứng viên");
            return;
        }

        setLoading(true);
        try {
            const proposalData = {
                so_to_trinh: values.so_to_trinh,
                ngay_to_trinh: values.ngay_to_trinh.format('YYYY-MM-DD'),
                ghi_chu: values.ghi_chu || "",
                danh_sach_ung_vien: candidatesToProcess,
                aggregation_mode: aggregationMode
            };

            const endpoint = editingProposal 
                ? `/personnel-proposals/${editingProposal.id}`
                : '/personnel-proposals';
            
            const method = editingProposal ? 'put' : 'post';
            await axiosClient[method](endpoint, proposalData);
            
            message.success(editingProposal ? "Cập nhật phương án nhân sự thành công!" : "Lập phương án nhân sự thành công!");
            onSuccess();
            handleCancel();
        } catch (error: any) {
            console.error("Lỗi khi lập phương án:", error);
            message.error(error.response?.data?.message || "Lỗi khi lập phương án nhân sự");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setProposalCandidates([]);
        setSelectedBatches([]);
        setAggregationMode(false);
        onCancel();
    };

    const handleCandidateChange = (chiTietId: number, field: 'loai_phuong_an' | 'ghi_chu', value: string) => {
        setProposalCandidates(prev => prev.map(pc => 
            pc.chi_tiet_bn_id === chiTietId 
                ? { ...pc, [field]: value }
                : pc
        ));
    };

    const batchColumns = [
        {
            title: (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Checkbox
                            checked={allSelected}
                            onChange={(e) => e.target.checked ? handleSelectAllBatches() : handleDeselectAllBatches()}
                            indeterminate={selectedCount > 0 && selectedCount < selectedBatches.length}
                        />
                        <span style={{ fontWeight: 'bold' }}>Chọn tất cả ({selectedCount}/{selectedBatches.length})</span>
                    </div>
                    {selectedCount > 0 && (
                        <span style={{ fontSize: '12px', color: '#1890ff', backgroundColor: '#e6f7ff', padding: '2px 8px', borderRadius: '4px' }}>
                            {totalCandidates} ứng viên
                        </span>
                    )}
                </div>
            ),
            key: "select",
            width: 200,
            render: (_: unknown, record: BatchSelection) => (
                <Checkbox
                    checked={record.selected}
                    onChange={(e) => handleBatchSelection(record.batch_id, e.target.checked)}
                />
            )
        },
        {
            title: "Tên đợt bổ nhiệm",
            dataIndex: 'ten_dot_bo_nhiem',
            key: 'ten_dot_bo_nhiem',
            width: 220,
            render: (text: string, record: BatchSelection) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        backgroundColor: record.selected ? '#1890ff' : '#d9d9d9' 
                    }}></div>
                    <span style={{ fontWeight: 'bold' }}>{text}</span>
                    {record.selected && (
                        <Tag color="success" style={{ fontSize: '10px' }}>Đã chọn</Tag>
                    )}
                </div>
            )
        },
        {
            title: "Số ứng viên",
            key: 'candidate_count',
            width: 120,
            render: (_: unknown, record: BatchSelection) => (
                <span style={{ 
                    fontWeight: 'bold', 
                    color: record.selected ? '#1890ff' : '#8c8c8c' 
                }}>
                    {record.candidates.length}
                </span>
            )
        }
    ];

    const candidateColumns = [
        {
            title: "Mã viên chức",
            dataIndex: 'ma_vien_chuc',
            key: 'ma_vien_chuc',
            width: 120,
            render: (text: string) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        backgroundColor: '#e6f7ff', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#1890ff' }}>
                            {text.substring(0, 2).toUpperCase()}
                        </span>
                    </div>
                    <span style={{ fontWeight: 'bold' }}>{text}</span>
                </div>
            )
        },
        {
            title: "Họ và tên",
            dataIndex: 'ho_va_ten',
            key: 'ho_va_ten',
            width: 200,
            render: (text: string) => (
                <div style={{ fontWeight: 'bold', color: '#262626' }}>{text}</div>
            )
        },
        {
            title: "Đơn vị",
            dataIndex: 'ten_don_vi',
            key: 'ten_don_vi',
            width: 150,
            render: (text: string) => (
                <Tag color="default">{text}</Tag>
            )
        },
        ...(aggregationMode ? [{
            title: "Đợt bổ nhiệm",
            dataIndex: 'ten_dot_bo_nhiem',
            key: 'ten_dot_bo_nhiem',
            width: 180,
            render: (text: string) => (
                <Tag color="blue">{text}</Tag>
            )
        }] : []),
        {
            title: "Loại phương án",
            key: 'loai_phuong_an',
            width: 150,
            render: (_: unknown, record: ChiTietBoNhiem) => {
                const currentValue = proposalCandidates.find(pc => pc.chi_tiet_bn_id === record.chi_tiet_bn_id)?.loai_phuong_an;
                
                return (
                    <Select
                        placeholder="Chọn loại phương án"
                        value={currentValue}
                        onChange={(value) => handleCandidateChange(record.chi_tiet_bn_id, 'loai_phuong_an', value)}
                        style={{ width: '100%' }}
                    >
                        <Option value="Bổ nhiệm">Bổ nhiệm</Option>
                        <Option value="Bổ nhiệm lại">Bổ nhiệm lại</Option>
                        <Option value="Thôi chức vụ">Thôi chức vụ</Option>
                        <Option value="Thôi kiêm nhiệm">Thôi kiêm nhiệm</Option>
                    </Select>
                );
            }
        },
        {
            title: "Ghi chú",
            key: 'ghi_chu',
            width: 200,
            render: (_: unknown, record: ChiTietBoNhiem) => (
                <TextArea
                    placeholder="Nhập ghi chú"
                    value={proposalCandidates.find(pc => pc.chi_tiet_bn_id === record.chi_tiet_bn_id)?.ghi_chu}
                    onChange={(e) => handleCandidateChange(record.chi_tiet_bn_id, 'ghi_chu', e.target.value)}
                    rows={2}
                    maxLength={500}
                />
            )
        }
    ];

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        backgroundColor: '#1890ff', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}>
                        <span style={{ color: 'white', fontWeight: 'bold' }}>PA</span>
                    </div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                            {editingProposal ? "Cập nhật phương án nhân sự" : "Lập phương án nhân sự"}
                        </div>
                        <div style={{ fontSize: '14px', color: '#8c8c8c' }}>
                            {aggregationMode 
                                ? `Gom ${selectedCount} đợt bổ nhiệm (${totalCandidates} ứng viên)` 
                                : `Phương án mới`
                            }
                        </div>
                    </div>
                </div>
            }
            open={visible}
            onCancel={handleCancel}
            width={1200}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Card title="Chế độ lập phương án" className="mb-4">
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Checkbox
                            checked={aggregationMode}
                            onChange={(e) => setAggregationMode(e.target.checked)}
                            disabled={!!editingProposal}
                        >
                            Gom nhiều đợt bổ nhiệm vào một phương án
                        </Checkbox>
                        
                        {aggregationMode && (
                            <>
                                <Divider />
                                <Card title="Chọn đợt bổ nhiệm" size="small">
                                    <Table
                                        rowKey="batch_id"
                                        columns={batchColumns}
                                        dataSource={selectedBatches}
                                        pagination={false}
                                        size="small"
                                    />
                                    <Button
                                        type="primary"
                                        onClick={handleAggregateCandidates}
                                        className="mt-3"
                                        disabled={selectedBatches.filter(b => b.selected).length === 0}
                                    >
                                        Gom ứng viên đã chọn
                                    </Button>
                                </Card>
                            </>
                        )}
                    </Space>
                </Card>

                <Card title="Thông tin tờ trình" className="mb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="Số tờ trình"
                            name="so_to_trinh"
                            rules={[{ required: true, message: 'Vui lòng nhập số tờ trình' }]}
                        >
                            <Input placeholder="Nhập số tờ trình" />
                        </Form.Item>
                        <Form.Item
                            label="Ngày tờ trình"
                            name="ngay_to_trinh"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày tờ trình' }]}
                        >
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </div>
                    <Form.Item
                        label="Ghi chú"
                        name="ghi_chu"
                    >
                        <TextArea 
                            placeholder="Nhập ghi chú cho phương án" 
                            rows={3}
                            maxLength={1000}
                        />
                    </Form.Item>
                </Card>

                {proposalCandidates.length > 0 && (
                    <Card title="Danh sách ứng viên trong phương án" className="mb-4">
                        <Table
                            rowKey="chi_tiet_bn_id"
                            columns={candidateColumns}
                            dataSource={(() => {
                                const allCandidates: ChiTietBoNhiem[] = [];
                                selectedBatches.forEach(batch => {
                                    if (batch.selected) {
                                        batch.candidates.forEach(candidate => {
                                            allCandidates.push({
                                                ...candidate,
                                                ten_dot_bo_nhiem: batch.ten_dot_bo_nhiem
                                            });
                                        });
                                    }
                                });
                                return allCandidates;
                            })()}
                            pagination={false}
                            scroll={{ x: 1200 }}
                        />
                    </Card>
                )}

                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '16px', 
                    backgroundColor: '#f5f5f5', 
                    borderTop: '1px solid #d9d9d9' 
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '14px', color: '#595959' }}>
                            <span style={{ fontWeight: 'bold' }}>Tổng ứng viên:</span> 
                            <span style={{ color: '#1890ff', fontWeight: 'bold', marginLeft: '4px' }}>
                                {proposalCandidates.length}
                            </span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#595959' }}>
                            <span style={{ fontWeight: 'bold' }}>Đã phân loại:</span>
                            <span style={{ color: '#52c41a', fontWeight: 'bold', marginLeft: '4px' }}>
                                {proposalCandidates.filter(pc => pc.loai_phuong_an).length}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button 
                            size="large"
                            onClick={handleCancel}
                            style={{ padding: '0 24px' }}
                        >
                            Hủy
                        </Button>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={loading}
                            disabled={proposalCandidates.length === 0}
                            size="large"
                            style={{ padding: '0 24px' }}
                        >
                            {editingProposal ? "Cập nhật" : "Lập phương án"}
                        </Button>
                    </div>
                </div>
            </Form>
        </Modal>
    );
};

export default PersonnelProposalModal;
