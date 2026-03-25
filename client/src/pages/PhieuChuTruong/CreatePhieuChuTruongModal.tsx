import { Form, Input, InputNumber, message, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import axiosClient from "../../utils/AxiosClient";

interface Props {
    isVisible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

export const CreatePhieuChuTruongModal: React.FC<Props> = ({ isVisible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [chucDanhList, setChucDanhList] = useState<{ id: number; ten_chuc_danh: string }[]>([]);

    useEffect(() => {
        if (!isVisible) return;
        form.resetFields();
        axiosClient.get("/positions").then(res => {
            setChucDanhList(res.data.data ?? []);
        });
    }, [isVisible]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            await axiosClient.post("/pct", values);
            message.success("Tạo phiếu chủ trương thành công!");
            onSuccess();
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Lỗi khi tạo phiếu chủ trương");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Lập phiếu xin chủ trương bổ nhiệm"
            open={isVisible}
            onOk={handleSubmit}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Gửi phiếu"
            cancelText="Hủy"
            width={680}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <Form.Item label="Số tờ trình" name="so_to_trinh_chu_truong"
                        rules={[{ required: true, message: "Nhập số tờ trình!" }]}>
                        <Input placeholder="VD: 12/TTr-ĐHCT" />
                    </Form.Item>

                    <Form.Item label="Chức danh đề xuất" name="chuc_danh_id"
                        rules={[{ required: true, message: "Chọn chức danh!" }]}>
                        <Select placeholder="Chọn chức danh" showSearch optionFilterProp="label"
                            options={chucDanhList.map(cd => ({ value: cd.id, label: cd.ten_chuc_danh }))} />
                    </Form.Item>

                    <Form.Item label="Số lượng đề xuất" name="so_luong_de_xuat"
                        rules={[{ required: true, message: "Nhập số lượng!" }]}>
                        <InputNumber min={1} style={{ width: "100%" }} placeholder="VD: 1" />
                    </Form.Item>

                    <Form.Item label="Nguồn nhân sự" name="nguon_nhan_su"
                        rules={[{ required: true, message: "Chọn nguồn nhân sự!" }]}>
                        <Select placeholder="Chọn nguồn" options={[
                            { value: 1, label: "Tại chỗ (trong quy hoạch)" },
                            { value: 2, label: "Điều động từ nơi khác" },
                            { value: 3, label: "Cả hai nguồn" },
                        ]} />
                    </Form.Item>
                </div>

                <Form.Item label="Tiêu đề" name="tieu_de"
                    rules={[{ required: true, message: "Nhập tiêu đề!" }]}>
                    <Input placeholder="VD: Tờ trình đề xuất bổ nhiệm Trưởng khoa CNTT" />
                </Form.Item>

                <Form.Item label="Lý do đề xuất" name="ly_do_de_xuat"
                    rules={[{ required: true, message: "Nêu lý do!" }, { min: 10, message: "Cần ít nhất 10 ký tự" }]}>
                    <Input.TextArea rows={4}
                        placeholder="Nêu rõ lý do và sự cần thiết phải bổ nhiệm..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};
