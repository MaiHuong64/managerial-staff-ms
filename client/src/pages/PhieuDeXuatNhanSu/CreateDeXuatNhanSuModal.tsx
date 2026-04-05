import { Form, Input, InputNumber, message, Modal, Select, Table } from "antd";
import { useEffect, useState } from "react";
import { createPhieuDeXuatNhanSu } from "../../api/phieuDeXuat.api";
import { getChucDanhList } from "../../api/chucDanh.api";
import type { VienChuc } from "../../types/VienChuc";

interface Props {
    isVisible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

export const CreateDeXuatNhanSuModal: React.FC<Props> = ({ isVisible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [chucDanhList, setChucDanhList] = useState<{ id: number; ten_chuc_danh: string }[]>([]);
    const [selectedVienChuc, setSelectedVienChuc] = useState<VienChuc[]>([]);
    useEffect(() => {
        if (!isVisible) return;
        form.resetFields();
        getChucDanhList().then(res => {
            setChucDanhList(res.data.data ?? []);
        });
        setSelectedVienChuc([])
    }, [isVisible, form]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            if(selectedVienChuc.length === 0){
                message.warning("Vui lòng chọn ít nhất 1 nhân sự");
                setLoading(false);
                return;
            }
            if(selectedVienChuc.length > values.so_luong_de_xuat){
                message.error(`Số lượng nhân sự (${selectedVienChuc.length}) vượt quá giới hạn đề xuất (${values.so_luong_de_xuat})!`);
                setLoading(false);
                return;
            }
            
            await createPhieuDeXuatNhanSu(values);
            message.success("Lập phiếu đề xuất nhân sự thành công!");
            onSuccess();
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Lỗi khi tạo phiếu chủ trương");
        } finally {
            setLoading(false);
        }
    };
    const columns = [
        { title: 'Mã VC', dataIndex: 'ma_vien_chuc', width: 100 },
        { title: 'Họ và tên', dataIndex: 'ho_va_ten', width: 180, render: (text: string) => <span className="font-medium text-slate-700">{text}</span> },
        { title: 'Đơn vị', dataIndex: 'ten_don_vi', width: 200 }
    ];
    return (
        <Modal
            title="Lập phiếu đề xuất nhân sự quy hoạch"
            open={isVisible}
            onOk={handleSubmit}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Gửi phiếu"
            cancelText="Hủy"
            width={850}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" className="mt-4" initialValues={{so_luong_de_xuat: 1}}>
                <div className="grid grid-cols-3 gap-4">
                    <Form.Item className="col-span-2" label={<span className="font-semibold text-slate-500">Chức danh</span>} name="chuc_danh_id" rules={[{required: true, message:"Vui lòng chọn chức danh"}]}>
                        <Select placeholder="--Chọn chức danh--" showSearch optionFilterProp="children"  options={chucDanhList.map(cd => ({ value: cd.id, label: cd.ten_chuc_danh }))}/>
                    </Form.Item>
                    <Form.Item className="col-span-1" label={<span className="font-semibold text-slate-800">Số lượng đề xuất</span>} name="so_luong_de_xuat" rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}>
                        <InputNumber min={1} max={3} style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                 <Form.Item label={<span className="font-semibold text-slate-800">Tiêu đề tờ trình</span>} name="tieu_de" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}>
                    <Input placeholder="VD: V/v đề xuất nhân sự quy hoạch chức danh Trưởng khoa..." />
                </Form.Item>

                <Form.Item label={<span className="font-semibold text-slate-800">Nội dung chi tiết</span>} name="noi_dung" >
                    <Input.TextArea rows={4}  placeholder="Trình bày lý do, căn cứ đề xuất..."  className="resize-none" />
                </Form.Item>

                <Form.Item
                    label={<span className="font-semibold text-slate-800">Ghi chú thêm</span>} name="ghi_chu" >
                    <Input placeholder="Các lưu ý khác (nếu có)..." />
                </Form.Item>

                <Table dataSource={selectedVienChuc} columns={columns} rowKey="id" pagination={false} size="small" bordered locale={{emptyText:"Chưa có nhân sự nào được chọn"}}/>
            </Form>
        </Modal>
    );
};
export default CreateDeXuatNhanSuModal