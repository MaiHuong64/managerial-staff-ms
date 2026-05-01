import { useEffect, useState } from "react";
import { type VienChuc } from "../VienChuc/LichSuNhiemKy";
import { type ChucDanh } from "../../types/ChucDanh";
import { getChucDanhList } from "../../api/chucDanh.api";
import { DatePicker, Form, message, Modal, Select } from "antd";
import { addNewCandidate170, filterCandidatesHandler } from "../../api/dotQuyHoach.api";
import { type DonVi } from "../../types/DonVi";
import dayjs from "dayjs"
import { getDonViList } from "../../api/donVi.api";
import { getVienChucList } from "../../api/vienChuc.api";

interface Props {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    dotQuyHoachId: number;
}
export const AddCandidateQT170: React.FC<Props> =({visible, onCancel, onSuccess, dotQuyHoachId}) => {
    const [form] = Form.useForm();
    // const [setLoading] = useState(false);
    const [danhSachVienChuc, setDanhSachVienChuc] = useState<VienChuc[]>([]);
    const [danhSachChucDanh, setDanhSachChucDanh] = useState<ChucDanh[]>([]);
    const [danhSachDonVi, setDanhSachDonVi] = useState<DonVi[]>([]); 

    useEffect(() => {
        if(!visible) return;
        getChucDanhList().then(res => setDanhSachChucDanh(res.data.data));
        getDonViList().then(res => {
            console.log(res);
            setDanhSachDonVi(res.data.data);
        });
        getVienChucList().then(res => setDanhSachVienChuc(res.data.data));
    }, [visible])

    const handelDonVi = async(donViId: number) => {
        form.setFieldsValue({vienChucId: undefined});
        const res = await filterCandidatesHandler(donViId, dotQuyHoachId);
        setDanhSachVienChuc(res.data.data);
    }
    const handleSubmit = async () => {
        try {
            const values = form.getFieldsValue();
            // setLoading(true);
            await addNewCandidate170(dotQuyHoachId, {
                vienChucId: values.vienChucId,
                chucDanhId: values.chucDanhId,
                donViId: values.donViId,
                ngayVaoQH:  values.ngayVaoQH.toDate()
            })
            message.success('Thêm ứng viên thành công');
            form.resetFields();
            onSuccess();
        } catch (error: any) {
            if (error?.errorFields) return;
            message.error(error?.response?.data?.message || 'Thêm ứng viên thất bại');
        } finally {
            // setLoading(false);
        }
    }
    return (
        <Modal title="Thêm ứng viên rà soát quy hoạch"
                open={visible}
                onCancel={onCancel}
                onOk={handleSubmit}
                okText="Thêm"
                cancelText="Hủy"
                width={500}
                destroyOnClose>
            <Form form={form} layout="vertical" className="mt-4">
                <Form.Item label="Đơn vị" name="donViId" rules={[{required: true, message:"Vui lòng chọn đơn vị"}]}>
                    <Select placeholder="Chọn đơn vị" onChange={handelDonVi} options={danhSachDonVi.map((dv: any) => ({
                        value: dv.id,
                        label: dv.tenDonVi,
                    }))}/>
                </Form.Item>

                <Form.Item label="Viên chức" name="vienChucId" rules={[{required: true, message:"Vui lòng chọn viên chức"}]}>
                    <Select placeholder="Chọn viên chức" optionFilterProp="label"
                            options={danhSachVienChuc.map((vc: any) => ({value: vc.id, label: `${vc.hoVaTen} — ${vc.maVienChuc}`,}))}/>
                </Form.Item>

                 <Form.Item label="Chức danh" name="chucDanhId" rules={[{required: true, message:"Vui lòng chọn chức danh quy hoạch"}]}>
                    <Select placeholder="Chọn chức danh" options={danhSachChucDanh.map((cd: any) => ({
                        value: cd.id,
                        label: cd.tenChucDanh,
                    }))}/>
                </Form.Item>

                 <Form.Item label="Ngày vào quy hoạch" name="ngayVaoQH" initialValue={dayjs()}rules={[{required: true, message:"Vui lòng chọn đơn vị"}]}>
                    <DatePicker format="DD/MM/YYYY" className="w-full"/>
                 </Form.Item>
            </Form>
        </Modal>
    )
}