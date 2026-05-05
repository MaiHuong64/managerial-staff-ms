import { Form, Input, InputNumber, message, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { createPhieuChuTruong } from "../../api/phieuChuTruong.api";
import { getChucDanhList } from "../../api/chucDanh.api";
import { getVienChucList } from "../../api/vienChuc.api";

interface Props {
    isVisible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

export const CreatePhieuChuTruongModal: React.FC<Props> = ({ isVisible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [chucDanhList, setChucDanhList] = useState<{ id: number; tenChucDanh: string }[]>([]);
    const [vienChucList, setVienChucList] = useState<{ id: number; hoVaTen: string; maVienChuc: string }[]>([]);
    const [nguonNhanSu, setNguonNhanSu] = useState<number | undefined>();

    useEffect(() => {
        if (!isVisible) return;
        form.resetFields();
        setNguonNhanSu(undefined);
        getChucDanhList().then(res => {
            setChucDanhList(res.data.data ?? []);
        });
        getVienChucList().then(res => {
            setVienChucList(res.data.data ?? []);
        });
    }, [isVisible, form]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            console.log("values: ",values)
            await createPhieuChuTruong(values);
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
                    <Form.Item label="Số tờ trình" name="soToTrinhChuTruong"
                        rules={[{ required: true, message: "Nhập số tờ trình!" }]}>
                        <Input placeholder="VD: 12/TTr-ĐHCT" />
                    </Form.Item>

                    <Form.Item label="Chức danh đề xuất" name="chucDanhId"
                        rules={[{ required: true, message: "Chọn chức danh!" }]}>
                        <Select placeholder="Chọn chức danh" showSearch optionFilterProp="label"
                            options={chucDanhList.map(cd => ({ value: cd.id, label: cd.tenChucDanh }))} />
                    </Form.Item>

                    <Form.Item label="Số lượng đề xuất" name="soLuongDeXuat"
                        rules={[{ required: true, message: "Nhập số lượng!" }]}>
                        <InputNumber min={1} style={{ width: "100%" }} placeholder="VD: 1" />
                    </Form.Item>

                    <Form.Item label="Nguồn nhân sự" name="nguonNhanSu"
                        rules={[{ required: true, message: "Chọn nguồn nhân sự!" }]}>
                        <Select placeholder="Chọn nguồn"
                            onChange={(value) => setNguonNhanSu(value)}
                            options={[
                            { value: 1, label: "Tại chỗ (trong quy hoạch)" },
                            { value: 2, label: "Điều động từ nơi khác" },
                        ]} />
                    </Form.Item>

                    {nguonNhanSu === 2 && (
                        <Form.Item label="Viên chức" name="vienChucId"
                            rules={[{ required: true, message: "Chọn viên chức!" }]}>
                            <Select placeholder="Chọn viên chức" showSearch
                                optionFilterProp="label"
                                options={vienChucList.map(vc => ({
                                    value: vc.id,
                                    label: `${vc.hoVaTen} (${vc.maVienChuc})`
                                }))} />
                        </Form.Item>
                    )}
                </div>

                <Form.Item label="Tiêu đề" name="tieuDe"
                    rules={[{ required: true, message: "Nhập tiêu đề!" }]}>
                    <Input placeholder="VD: Tờ trình đề xuất bổ nhiệm Trưởng khoa CNTT" />
                </Form.Item>

                <Form.Item label="Lý do đề xuất" name="lyDoDeXuat"
                    rules={[{ required: true, message: "Nêu lý do!" }]}>
                    <Input.TextArea rows={4}
                        placeholder="Nêu rõ lý do và sự cần thiết phải bổ nhiệm..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};
