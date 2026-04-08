import { Button, Card, DatePicker, Form, Input, Select, Table, Tag, message } from "antd";
import { useState } from "react";
import dayjs from 'dayjs';
import { FileTextOutlined, UserOutlined } from "@ant-design/icons";
import type { PersonnelData } from "./SelectedPersonnel";
import { createPhuongAn } from "../../api/phuongAnNhanSu.api";

const LOAI_PHUONG_AN = [
    { value: 'Bổ nhiệm', label: 'Bổ nhiệm' },
    { value: 'Bổ nhiệm lại', label: 'Bổ nhiệm lại' },
    { value: 'Thôi chức vụ', label: 'Thôi chức vụ' },
    { value: 'Thôi kiêm nhiệm', label: 'Thôi kiêm nhiệm' },
];

interface ChiTietRow extends PersonnelData {
    loai_phuong_an: string;
    ghi_chu: string;
}

interface CreatePhuongAnFormProps {
    selectedPersonnel: PersonnelData[];
    onSuccess: () => void;
    onCancel: () => void;
}

export const CreatePhuongAnForm: React.FC<CreatePhuongAnFormProps> = ({ selectedPersonnel, onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [chiTiet, setChiTiet] = useState<ChiTietRow[]>(
        selectedPersonnel.map(p => ({ ...p, loai_phuong_an: 'Bổ nhiệm', ghi_chu: '' }))
    );

    const handleDetailChange = (id: number, field: 'loai_phuong_an' | 'ghi_chu', value: string) => {
        setChiTiet(prev => prev.map(item =>
            item.chi_tiet_bn_id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const payload = {
                soToTrinh: values.so_to_trinh,
                ngayTrinh: values.ngay_to_trinh ? dayjs(values.ngay_to_trinh).format('YYYY-MM-DD') : null,
                ngayLap: dayjs().format('YYYY-MM-DD'),
                ghiChu: values.ghi_chu,
                chiTiet: chiTiet.map(item => ({
                    chiTietBnId: item.chi_tiet_bn_id,
                    loaiPhuongAn: item.loai_phuong_an,
                    ghiChu: item.ghi_chu || null,
                })),
            };
            const res = await createPhuongAn(payload);
            if (res.data.success) {
                message.success('Tạo phương án thành công!');
                form.resetFields();
                onSuccess?.();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi tạo phương án');
        } finally {
            setLoading(false);
        }
    };

    const cols = [
        {
            title: 'Họ và tên', dataIndex: 'ho_va_ten', key: 'ho_va_ten', width: 180,
            render: (text: string) => (
                <div className="flex items-center gap-2">
                    <UserOutlined className="text-blue-400" />
                    <span className="font-medium">{text}</span>
                </div>
            ),
        },
        {
            title: 'Chức danh', dataIndex: 'ten_chuc_danh', key: 'ten_chuc_danh', width: 160,
            render: (text: string) => <Tag color="purple">{text}</Tag>,
        },
        {
            title: 'Loại phương án', key: 'loai_phuong_an', width: 180,
            render: (_: unknown, record: ChiTietRow) => (
                <Select
                    size="small"
                    style={{ width: '100%' }}
                    value={record.loai_phuong_an}
                    options={LOAI_PHUONG_AN}
                    onChange={val => handleDetailChange(record.chi_tiet_bn_id, 'loai_phuong_an', val)}
                />
            ),
        },
        {
            title: 'Ghi chú', key: 'ghi_chu',
            render: (_: unknown, record: ChiTietRow) => (
                <Input
                    size="small"
                    placeholder="Ghi chú..."
                    value={record.ghi_chu}
                    onChange={e => handleDetailChange(record.chi_tiet_bn_id, 'ghi_chu', e.target.value)}
                />
            ),
        },
    ];

    return (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Card size="small" className="mb-4"
                title={<span><FileTextOutlined className="mr-2 text-blue-500" />Thông tin chung phương án</span>}>
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item label="Số tờ trình" name="so_to_trinh">
                        <Input placeholder="VD: 18/TTr-ĐHAG" />
                    </Form.Item>
                    <Form.Item label="Ngày lập tờ trình" name="ngay_to_trinh">
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Ghi chú" name="ghi_chu" className="col-span-2">
                        <Input.TextArea rows={2} placeholder="Ghi chú thêm..." />
                    </Form.Item>
                </div>
            </Card>

            <Card size="small" className="mb-4"
                title={`Danh sách nhân sự (${chiTiet.length} người)`}>
                <Table
                    rowKey="chi_tiet_bn_id"
                    columns={cols}
                    dataSource={chiTiet}
                    pagination={false}
                    size="small"
                    bordered
                />
            </Card>

            <div className="flex justify-end gap-2 mt-4">
                <Button onClick={onCancel}>Hủy bỏ</Button>
                <Button type="primary" htmlType="submit" loading={loading}>Lưu phương án</Button>
            </div>
        </Form>
    );
};

export default CreatePhuongAnForm;
