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
    loaiPhuongAn: string;
    ghiChu: string;
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
        selectedPersonnel.map(p => ({ ...p, loaiPhuongAn: 'Bổ nhiệm', ghiChu: '' }))
    );

    const handleDetailChange = (id: number, field: 'loaiPhuongAn' | 'ghiChu', value: string) => {
        setChiTiet(prev => prev.map(item =>
            item.chiTietBnId === id ? { ...item, [field]: value } : item
        ));
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const payload = {
                soToTrinh: values.soToTrinh,
                ngayTrinh: values.ngayToTrinh ? dayjs(values.ngayToTrinh).format('YYYY-MM-DD') : null,
                ngayLap: dayjs().format('YYYY-MM-DD'),
                ghiChu: values.ghiChu,
                chiTiet: chiTiet.map(item => ({
                    chiTietBnId: item.chiTietBnId,
                    loaiPhuongAn: item.loaiPhuongAn,
                    ghiChu: item.ghiChu || null,
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
            title: 'Họ và tên', dataIndex: 'hoVaTen', key: 'hoVaTen', width: 180,
            render: (text: string) => (
                <div className="flex items-center gap-2">
                    <UserOutlined className="text-blue-400" />
                    <span className="font-medium">{text}</span>
                </div>
            ),
        },
        {
            title: 'Chức danh', dataIndex: 'tenChucDanh', key: 'tenChucDanh', width: 160,
            render: (text: string) => <Tag color="purple">{text}</Tag>,
        },
        {
            title: 'Loại phương án', key: 'loaiPhuongAn', width: 180,
            render: (_: unknown, record: ChiTietRow) => (
                <Select
                    size="small"
                    style={{ width: '100%' }}
                    value={record.loaiPhuongAn}
                    options={LOAI_PHUONG_AN}
                    onChange={val => handleDetailChange(record.chiTietBnId, 'loaiPhuongAn', val)}
                />
            ),
        },
        {
            title: 'Ghi chú', key: 'ghiChu',
            render: (_: unknown, record: ChiTietRow) => (
                <Input
                    size="small"
                    placeholder="Ghi chú..."
                    value={record.ghiChu}
                    onChange={e => handleDetailChange(record.chiTietBnId, 'ghiChu', e.target.value)}
                />
            ),
        },
    ];

    return (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Card size="small" className="mb-4"
                title={<span><FileTextOutlined className="mr-2 text-blue-500" />Thông tin chung phương án</span>}>
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item label="Số tờ trình" name="soToTrinh">
                        <Input placeholder="VD: 18/TTr-ĐHAG" />
                    </Form.Item>
                    <Form.Item label="Ngày lập tờ trình" name="ngayToTrinh">
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Ghi chú" name="ghiChu" className="col-span-2">
                        <Input.TextArea rows={2} placeholder="Ghi chú thêm..." />
                    </Form.Item>
                </div>
            </Card>

            <Card size="small" className="mb-4"
                title={`Danh sách nhân sự (${chiTiet.length} người)`}>
                <Table
                    rowKey="chiTietBnId"
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
