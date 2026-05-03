import { Button, Card, Col, DatePicker, Form, Input, InputNumber, message, Radio, Row, Select, Space } from "antd";
import type { DonVi } from "../../types/DonVi";
import { useEffect, useState } from "react";
import { getDonViList } from "../../api/donVi.api";
import { createVienChuc, getVienChucById, updateVienChuc } from "../../api/vienChuc.api";
import { useNavigate, useParams } from "react-router";
import dayjs from "dayjs";

interface CreateStaffForm {
    hoVaTen: string;
    gioiTinh: string;
    ngaySinh: dayjs.Dayjs | null;
    soCccd: string;
    danToc: string;
    donViId: number;
    soDienThoai: string;
    email: string;
    diaChi: string;
    trinhDoChuyenMon: string;
    chuyenNganh: string;
    namTotNghiep: number;
    ngach: string;
    trinhDoLyLuanCt: string;
    trinhDoNgoaiNgu: string;
    trinhDoTinHoc: string;
    ngayKetNap: dayjs.Dayjs | null;
    ngayChinhThuc: dayjs.Dayjs | null;
}

export const  CreateStaffPage: React.FC = ()  => {
    const {id} = useParams()
    const isEditMode = !!id;
    const [form] = Form.useForm();
    const [danhSachDonVi, setDanhSachDonVi] = useState<DonVi[]>([]);
    const [loadingDonVi, setLoadingDonVi] = useState(false);
    const [submitting, setSubmitting] = useState(false); 
    const navigate = useNavigate();
    
    useEffect(() => {
        const loadDonVi = async () => {
            setLoadingDonVi(true);
            try {
                const res = await getDonViList();
                setDanhSachDonVi(res.data.data);
            } catch (error) {
                console.log(error);
                message.error('Không thể tải danh sách đơn vị!');
            } finally {
                setLoadingDonVi(false);
            }
        };
        
        loadDonVi();
    }, []);

    useEffect(() => {
        if (!isEditMode) return;
        const loadStaffData = async () => {
            try{
                const res = await getVienChucById(Number(id));
                const values = res.data.data;
                if (values) {
                    form.setFieldsValue({
                        hoVaTen: values.hoVaTen,
                        gioiTinh: values.gioiTinh === 1 ? "Nam" : "Nữ",
                        ngaySinh: values.ngaySinh ? dayjs(values.ngaySinh) : null,
                        soCccd: values.soCccd,
                        danToc: values.danToc,
                        soDienThoai: values.soDienThoai,
                        email: values.email,
                        diaChi: values.diaChi,
                        trinhDoChuyenMon: values.trinhDoChuyenMon,
                        chuyenNganh: values.chuyenNganh,
                        ngach: values.ngach,
                        namTotNghiep: values.namTotNghiep,
                        trinhDoLyLuanCt: values.trinhDoLyLuanCt,
                        trinhDoNgoaiNgu: values.trinhDoNgoaiNgu,
                        trinhDoTinHoc: values.trinhDoTinHoc,
                        ngayKetNap: values.ngayKetNap ? dayjs(values.ngayKetNap) : null,        // ← convert
                        ngayChinhThuc: values.ngayChinhThuc ? dayjs(values.ngayChinhThuc) : null, // ← convert
                        donViId: values.donViId,
                    });
                } else {
                    message.error('Viên chức không tồn tại!');
                    navigate('/vien-chuc');
                }
            } catch (error) {
                console.log(error);
                message.error('Không thể tải thông tin viên chức!');
                navigate('/vien-chuc');
            }
        };

        loadStaffData();
    }, [isEditMode, id, form, navigate]);

    const onFinish = async (values: CreateStaffForm) => {
        try {
            setSubmitting(true);
            const payload = {
                ...values,
                gioiTinh: values.gioiTinh === "Nam" ? 1 : 0,
                ngaySinh: values.ngaySinh?.format('YYYY-MM-DD') ?? null,
                ngayKetNap: values.ngayKetNap?.format('YYYY-MM-DD') ?? null,
                ngayChinhThuc: values.ngayChinhThuc?.format('YYYY-MM-DD') ?? null,
            }
            if (isEditMode) {
                await updateVienChuc(Number(id), payload);
                message.success('Cập nhật viên chức thành công!');
            } else {
                await createVienChuc(payload);
                message.success('Tạo viên chức thành công!');
            }
            navigate('/vien-chuc');

        } catch (error) {
            console.log(error);
            message.error('Có lỗi xảy ra khi tạo viên chức!');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-5xl mx-auto transition-all duration-300 animate-fade-in pb-10">
            {/* Khung Form sử dụng cấu trúc Cards */}
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={onFinish}
                requiredMark={true}
                className="flex flex-col gap-6"
            >
                {/* --- THÔNG TIN CÁ NHÂN --- */}
                <Card 
                    title={<Space><span className="font-semibold">Thông tin cá nhân</span></Space>}
                    className="shadow-sm rounded-2xl border-slate-200 overflow-hidden"
                    headStyle={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '12px 24px' }}
                    bodyStyle={{ padding: '24px' }}
                >
                    <Row gutter={24}>
                        <Col xs={24} md={12} lg={8}>
                            <Form.Item name="hoVaTen" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}>
                                <Input size="large" placeholder="Ví dụ: Nguyễn Văn A" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12} lg={8}>
                            <Form.Item name="gioiTinh" label="Giới tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}>
                                <Radio.Group size="large">
                                    <Radio value="Nam">Nam</Radio>
                                    <Radio value="Nữ">Nữ</Radio>
                                    {/* <Radio value="Khác">Khác</Radio> */}
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12} lg={8}>
                            <Form.Item name="ngaySinh" label="Ngày sinh">
                                <DatePicker size="large" className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12} lg={8}>
                            <Form.Item name="soCccd" label="Số CCCD" rules={[{ required: true, message: 'Vui lòng nhập CCCD!' },{ len: 12, message: 'CCCD phải đủ 12 số!' }]}>
                                <Input size="large" placeholder="Nhập 12 số CCCD" />
                            </Form.Item>
                        </Col>  
                        <Col xs={24} md={12} lg={8}>
                            <Form.Item name="danToc" label="Dân tộc">
                                <Input size="large" placeholder="Ví dụ: Kinh, Tày..." />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12} lg={8}>
                            <Form.Item name="donViId" label="Đơn vị công tác"  rules={[{ required: true, message: 'Vui lòng chọn đơn vị!' }]}>
                            <Select placeholder="-- Chọn đơn vị --" loading={loadingDonVi} >
                                {danhSachDonVi.map((donVi) => (
                                    <Select.Option key={donVi.id} value={donVi.id}>
                                        {donVi.tenDonVi}
                                    </Select.Option>
                                ))}
                            </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="soDienThoai" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}>
                                <Input size="large" placeholder="Nhập số điện thoại" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập Email!' },{ type: 'email', message: 'Email không hợp lệ!' }]}>
                                <Input size="large" placeholder="email@domain.com" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="diaChi" label="Địa chỉ thường trú">
                                <Input.TextArea size="large" rows={2} placeholder="Nhập số nhà, tên đường, xã/phường..." className="resize-none" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* --- THÔNG TIN CHUYÊN MÔN --- */}
                <Card 
                    title={<Space><span className="font-semibold text-emerald-800">Thông tin chuyên môn</span></Space>}
                    className="shadow-sm rounded-2xl border-slate-200 overflow-hidden"
                    headStyle={{ backgroundColor: '#ecfdf5', borderBottom: '1px solid #d1fae5', padding: '12px 24px' }}
                    bodyStyle={{ padding: '24px' }}
                >
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item name="trinhDoChuyenMon" label="Trình độ chuyên môn" rules={[{ required: true, message: 'Vui lòng chọn trình độ chuyên môn!' }]}>
                                <Select size="large" placeholder="-- Chọn --" options={[
                                    { value: 'Thạc sĩ', label: 'Thạc sĩ' },
                                    { value: 'Tiến sĩ', label: 'Tiến sĩ' },
                                    { value: 'Khác', label: 'Khác' },
                                ]} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="chuyenNganh" label="Chuyên ngành">
                                <Input size="large" placeholder="Ví dụ: Khoa học máy tính" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="namTotNghiep" label="Năm tốt nghiệp" rules={[{ type: 'number', min: 1900, message: 'Năm tốt nghiệp không hợp lệ!' }]}>
                                <InputNumber size="large" placeholder="Ví dụ: 2020" className="w-full" min={1900} max={new Date().getFullYear()} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="ngach" label="Ngạch viên chức" rules={[{ required: true, message: 'Vui lòng nhập ngạch viên chức!' }]}>
                                <Input size="large" placeholder="Ví dụ: Giảng viên (V.07.01.03)" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* --- ĐẢNG ĐOÀN & KHÁC --- */}
                <Card 
                    title={<Space> <span className="font-semibold text-rose-800">Đoàn thể & Khác</span></Space>}
                    className="shadow-sm rounded-2xl border-slate-200 overflow-hidden"
                    headStyle={{ backgroundColor: '#fff1f2', borderBottom: '1px solid #ffe4e6', padding: '12px 24px' }}
                    bodyStyle={{ padding: '24px' }}
                >
                    <Row gutter={24}>
                        <Col xs={24} md={8}>
                            <Form.Item name="trinhDoLyLuanCt" label="Lý luận Chính trị">
                                <Input size="large" placeholder="Sơ/Trung/Cao cấp" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="trinhDoNgoaiNgu" label="Ngoại ngữ">
                                <Input size="large" placeholder="Bậc 3 / IELTS..." />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="trinhDoTinHoc" label="Tin học">
                                <Input size="large" placeholder="Cơ bản / Nâng cao" />
                            </Form.Item>
                        </Col>
                        
                        {/* Box chứa thông tin Đảng */}
                        <Col span={24}>
                            <div className="bg-rose-50/50 p-5 rounded-xl border border-rose-100 mt-2">
                                <Row gutter={24}>
                                    <Col xs={24} md={12}>
                                        <Form.Item name="ngayKetNap" label="Ngày kết nạp Đảng" className="mb-0">
                                            <DatePicker size="large" className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item name="ngayChinhThuc" label="Ngày chính thức" className="mb-0">
                                            <DatePicker size="large" className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>
                </Card>
                <div className="flex justify-end gap-3">
                <Button size="large" onClick={() => navigate('/vien-chuc')}>
                    Hủy
                </Button>
                <Button type="primary" size="large" htmlType="submit" loading={submitting}>
                    {isEditMode ? 'Cập nhật' : 'Lưu viên chức'}
                </Button>
            </div>
            </Form>

            
        </div>
        
    )  
}