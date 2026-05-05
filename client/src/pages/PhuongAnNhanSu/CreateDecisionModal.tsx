import React, { useEffect, useState } from 'react';
import { Modal, Steps, Form, Input, DatePicker, Select, Row, Col, Avatar, Button, Tag, Descriptions, message, Alert, Spin } from 'antd';
import { UserOutlined, FileDoneOutlined, CheckCircleOutlined, ArrowRightOutlined, IdcardOutlined, SafetyCertificateOutlined, CloseOutlined } from '@ant-design/icons';
import { createQDBoNhiem, getHoSoInfoForQD } from '../../api/quyetDinhBoNhiem';
import type { QuyetDinhBoNhiem } from '../../types/QuyetDinhBoNhiem';
import { getTaiKhoanByVienChucId, updateVaiTro } from '../../api/taiKhoan.api';
import type { TaiKhoan } from '../../types/TaiKhoan';
import dayjs from 'dayjs';

interface CreateDecisionModalProps {
    isOpen: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    dossier: QuyetDinhBoNhiem;
}

interface HoSoInfo {
    vienChucId: number;
    hoVaTen: string;    
    maVienChuc: string;
    chucDanhId: number;
    tenChucDanh: string;
    thoiHanGiuChucVu: number;
    tenDonVi: string;
    loaiPhuongAn: number;
}   
interface QuyetDinhFormValues {
    soQuyetDinh: string;
    ngayQuyetDinh: dayjs.Dayjs;
    ngayCoHieuLuc: dayjs.Dayjs;
    thoiHan: number;
    loaiBoNhiem: string;
    nguoiPheDuyet: string;
    chucVu: string;
}
const CreateDecisionModal: React.FC<CreateDecisionModalProps> = ({ isOpen, onCancel, dossier, onSuccess }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [hoSoInfo, setHoSoInfo] = useState<HoSoInfo | null>(null);
    const [formValues, setFormValues] = useState<QuyetDinhFormValues | null>(null);
    const [taiKhoan, setTaiKhoan] = useState<TaiKhoan | null>(null);
    const [upgradingRole, setUpgradingRole] = useState(false);
    useEffect(() => {
        if (isOpen && dossier) {
            setLoadingInfo(true);
            Promise.all([
                getHoSoInfoForQD(dossier.id),
            ])
                .then(([resHoSo]) => {
                    const info = resHoSo.data.data;
                    setHoSoInfo(info);

                    const loaiBoNhiem = info.loaiPhuongAn;

                    form.setFieldsValue({
                        loaiBoNhiem: loaiBoNhiem,
                        thoiHan: info.thoiHanGiuChucVu || 60
                    });

                    // Fetch tài khoản của viên chức
                    getTaiKhoanByVienChucId(info.vienChucId)
                        .then(resTK => {
                            if (resTK.data.success) {
                                setTaiKhoan(resTK.data.data);
                            }
                        })
                        .catch(() => {
                            // Không có tài khoản - bỏ qua
                        });
                })
                .catch(() => message.error('Không thể tải thông tin hồ sơ'))
                .finally(() => setLoadingInfo(false));
        }
    }, [isOpen, dossier, form]);

    const next = async () => {
        try {
            await form.validateFields();
            setFormValues(form.getFieldsValue(true));
            setCurrentStep(currentStep + 1);
        } catch (error) {
            console.log('Validation failed:', error);
        }
    };

    const prev = () => setCurrentStep(currentStep - 1);

    const handleUpgradeRole = async () => {
        if (!taiKhoan) return;

        try {
            setUpgradingRole(true);
            await updateVaiTro(taiKhoan.id, 'VCQL');
            message.success('Đã nâng cấp vai trò thành công!');
            setTaiKhoan({ ...taiKhoan, vaiTro: 'VCQL' });
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Lỗi khi nâng cấp vai trò');
        } finally {
            setUpgradingRole(false);
        }
    };

    const handleFinish = async () => {
        setLoading(true);
        try {
            const values = formValues || form.getFieldsValue(true);
            const payload = {
                soQuyetDinh: values.soQuyetDinh,
                ngayQuyetDinh: dayjs(values.ngayQuyetDinh),
                ngayCoHieuLuc: dayjs(values.ngayCoHieuLuc),
                // thoiHan: Number(values.thoiHan),
                loaiBoNhiem: values.loaiBoNhiem,
                nguoiPheDuyet: values.nguoiPheDuyet,
                chucVu: values.chucVu
            };
            console.log(payload) 
            await createQDBoNhiem(dossier.id, payload);
            message.success('Ban hành quyết định thành công!');
            onSuccess();
            setCurrentStep(0);
            form.resetFields();
        } catch (error) {
            console.error('Error creating decision:', error);
            message.error('Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const renderForm = () => {
        if (loadingInfo) {
            return <div className="flex justify-center items-center py-20"><Spin size="large" tip="Đang tải thông tin..." /></div>;
        }

        if (!hoSoInfo) {
            return <Alert message="Không thể tải thông tin hồ sơ" type="error" />;
        }

        return (
            <div className="mt-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-[#002140] p-5 rounded-2xl border border-blue-900/50 shadow-xl mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Avatar size={60} icon={<UserOutlined />} className="bg-blue-600 border-2 border-blue-400/30 shadow-inner" />
                                <div className="absolute -bottom-1 -right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-[#002140]"></div>
                            </div>
                            <div>
                                <div className="text-xl font-bold text-white leading-tight">{hoSoInfo.hoVaTen}</div>
                                <div className="text-[11px] text-blue-300 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                    <IdcardOutlined className="text-blue-400" /> {hoSoInfo.tenChucDanh} • {hoSoInfo.maVienChuc}
                                </div>
                                <div className="text-[10px] text-blue-400 mt-1">{hoSoInfo.tenDonVi}</div>
                            </div>
                        </div>
                        <Tag color="blue" className="rounded-full px-4 py-1 m-0 bg-blue-500/20 border-blue-500/50 text-blue-200 font-bold uppercase text-[10px] tracking-wider shadow-sm">
                            {form.getFieldValue('loaiBoNhiem')}
                        </Tag>
                    </div>
                </div>

                {taiKhoan && taiKhoan.vaiTro === 'VC' && (
                    <Alert
                        message={<span className="font-bold text-orange-900">Cần nâng cấp quyền tài khoản</span>}
                        description={
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-orange-800">
                                    Viên chức này đang có vai trò <Tag color="default" className="mx-1">VC</Tag>.
                                    Sau khi bổ nhiệm, cần nâng lên <Tag color="blue" className="mx-1">VCQL</Tag> để truy cập đầy đủ chức năng.
                                </div>
                                <Button
                                    type="primary"
                                    size="small"
                                    loading={upgradingRole}
                                    onClick={handleUpgradeRole}
                                    className="ml-4 bg-orange-600 hover:bg-orange-700"
                                >
                                    Nâng cấp ngay
                                </Button>
                            </div>
                        }
                        type="warning"
                        showIcon
                        className="mb-4 rounded-xl"
                    />
                )}

                {taiKhoan && taiKhoan.vaiTro === 'VCQL' && (
                    <Alert
                        message={<span className="font-bold text-green-900">Quyền tài khoản đã phù hợp</span>}
                        description={
                            <span className="text-sm text-green-800">
                                Viên chức đã có vai trò <Tag color="blue" className="mx-1">VCQL</Tag>
                            </span>
                        }
                        type="success"
                        showIcon
                        className="mb-4 rounded-xl"
                    />
                )}

                <Form form={form} layout="vertical">
                    <div className="space-y-6">
                        <section>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-5 flex items-center gap-3">
                                <div className="h-px bg-slate-200 flex-1"></div>
                                Thông tin quyết định
                                <div className="h-px bg-slate-200 flex-1"></div>
                            </div>

                            <Form.Item label={<span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Số quyết định</span>} name="soQuyetDinh" rules={[{ required: true, message: 'Nhập số quyết định' }]}>
                                <Input placeholder="VD: 123/QĐ-ĐHAG" size="large" className="rounded-xl border-slate-200 h-11 font-mono text-blue-700" />
                            </Form.Item>

                            <Row gutter={20}>
                                <Col span={12}>
                                    <Form.Item label={<span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Ngày quyết định</span>} name="ngayQuyetDinh" rules={[{ required: true }]}>
                                        <DatePicker className="w-full h-11 rounded-xl" format="DD/MM/YYYY" placeholder="Chọn ngày" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label={<span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Ngày có hiệu lực</span>} name="ngayCoHieuLuc" rules={[{ required: true }]}>
                                        <DatePicker
                                            className="w-full h-11 rounded-xl border-blue-200 bg-blue-50/20"
                                            format="DD/MM/YYYY"
                                            placeholder="Ngày bắt đầu"
                                              onChange={() => form.validateFields()}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="thoiHan" hidden>
                                <Input type="number" />
                            </Form.Item>

                            <Form.Item label={<span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Loại bổ nhiệm</span>} name="loaiBoNhiem">
                                <Select className="w-full h-11" options={[
                                    { value: 'Bổ nhiệm', label: 'Bổ nhiệm' },
                                    { value: 'Bổ nhiệm lại', label: 'Bổ nhiệm lại' },
                                    { value: 'Tái bổ nhiệm', label: 'Tái bổ nhiệm' },
                                ]} />
                            </Form.Item>
                        </section>

                        <section>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-5 flex items-center gap-3 pt-2">
                                <div className="h-px bg-slate-200 flex-1"></div>
                                Người ký ban hành
                                <div className="h-px bg-slate-200 flex-1"></div>
                            </div>

                            <Row gutter={20}>
                                <Col span={14}>
                                    <Form.Item label={<span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Họ tên người ký</span>} name="nguoiPheDuyet">
                                        <Input placeholder="Họ và tên..." className="rounded-xl h-11 font-semibold" />
                                    </Form.Item>
                                </Col>
                                <Col span={10}>
                                    <Form.Item label={<span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Chức vụ</span>} name="chucVu">
                                        <Input placeholder="Chức vụ..." className="rounded-xl h-11" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </section>
                    </div>
                </Form>
            </div>
        );
    };

    const renderConfirm = () => {
        if( !formValues ) return;
        return (
            <div className="mt-8 animate-in slide-in-from-right-6 duration-400">
                <Alert
                    message={<span className="font-bold text-blue-900">Xác nhận ban hành quyết định</span>}
                    description={
                        <div className="text-[11px] text-blue-800 space-y-1 mt-1">
                            <p>Hệ thống sẽ thực hiện các thao tác tự động:</p>
                            <ul className="list-disc ml-4 font-semibold">
                                <li>Đóng nhiệm kỳ cũ (nếu có)</li>
                                <li>Tạo nhiệm kỳ mới từ ngày {formValues.ngayCoHieuLuc?.format('DD/MM/YYYY')}</li>
                                <li>Cập nhật trạng thái hồ sơ</li>
                            </ul>
                        </div>
                    }
                    type="info"
                    showIcon
                    icon={<SafetyCertificateOutlined className="text-lg" />}
                    className="mb-6 rounded-2xl border-blue-100"
                />

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                    <div className="bg-slate-50 px-5 py-3 border-b flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tóm tắt văn bản pháp lý</span>
                        <Tag color="blue" className="m-0 text-[9px] font-black uppercase border-0 px-2 leading-loose">Bản dự thảo</Tag>
                    </div>
                    <Descriptions column={1} bordered size="small" className="custom-descriptions">
                        <Descriptions.Item label={<span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">Số Quyết định</span>}>
                            <span className="font-mono font-bold text-blue-700 text-base">{formValues.soQuyetDinh}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label={<span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">Ngày hiệu lực</span>}>
                            <span className="font-bold text-slate-800">{formValues.ngayCoHieuLuc?.format('DD/MM/YYYY')}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label={<span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">Đại diện ký</span>}>
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-800">{formValues.nguoiPheDuyet}</span>
                                <span className="text-xs text-slate-500">{formValues.chucVu}</span>
                            </div>
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            </div>
        );
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-3 py-2">
                    <div className="bg-blue-100 p-2.5 rounded-2xl shadow-sm">
                        <FileDoneOutlined className="text-blue-600 text-xl" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-slate-900 font-black text-lg leading-tight tracking-tight">Quy trình ban hành Quyết định</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bước {currentStep + 1}/2</span>
                    </div>
                </div>
            }
            open={isOpen}
            onCancel={() => { setCurrentStep(0); onCancel(); }}
            width={640}
            closeIcon={<div className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-all flex items-center justify-center"><CloseOutlined className="text-slate-400 text-xs" /></div>}
            footer={
                <div className="flex items-center justify-between px-2 pt-2 pb-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${currentStep === 0 ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                        {currentStep === 0 ? 'Nhập thông tin ban hành' : 'Xác nhận lần cuối'}
                    </div>
                    <div className="flex gap-3">
                        {currentStep === 1 && (
                            <Button onClick={prev} className="rounded-2xl font-bold text-slate-500 h-11 px-6 border-slate-200">
                                Quay lại
                            </Button>
                        )}
                        <Button
                            type="primary"
                            loading={loading}
                            onClick={currentStep === 0 ? next : handleFinish}
                            className="rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 h-11 min-w-35 shadow-xl shadow-blue-100 border-none flex items-center justify-center gap-2"
                        >
                            {currentStep === 0 ? (
                                <>Tiếp theo <ArrowRightOutlined className="text-xs" /></>
                            ) : (
                                <>Ban hành Quyết định <CheckCircleOutlined className="text-xs" /></>
                            )}
                        </Button>
                    </div>
                </div>
            }
            destroyOnClose
            centered
            className="custom-decision-modal"
        >
            <div className="px-6">
                <Steps
                    current={currentStep}
                    size="small"
                    className="mt-4 mb-2"
                    items={[
                        { title: <span className="text-[11px] font-black uppercase tracking-wider">Nhập liệu</span> },
                        { title: <span className="text-[11px] font-black uppercase tracking-wider">Xác nhận</span> }
                    ]}
                />
            </div>

            {currentStep === 0 ? renderForm() : renderConfirm()}
        </Modal>
    );
};
export default CreateDecisionModal;