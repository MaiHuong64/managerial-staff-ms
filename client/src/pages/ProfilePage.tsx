import React, { useEffect, useState } from "react";
import { Divider } from 'antd';
import axiosClient from "../utils/AxiosClient";
import type { profile } from "../types/profile";
import { useAuth } from "../hook/useAuth";
import { Navigate } from "react-router-dom";
import { UserOutlined, CalendarOutlined, IdcardOutlined, PhoneOutlined, MailOutlined, BankOutlined } from '@ant-design/icons';

const format = (d: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

const Field = ({ label, value, icon }: { label: string; value: string | number | null; icon?: React.ReactNode }) => (
    <div className="group p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <span className="text-indigo-500">{icon}</span> {label}
        </p>
        <p className="text-[14px] text-gray-700 font-semibold leading-tight">{value || '—'}</p>
    </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-hidden">
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-600">{title}</p>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<profile | null>(null);

    useEffect(() => {
        axiosClient.get('/staff/profile')
            .then(res => setProfile(res.data.data))
            .catch(console.error);
    }, []);

    if (!user) return <Navigate to="/login" replace />;
    if (!profile) return (
        <div className="flex justify-center items-center h-screen text-gray-400 italic font-light">
            Đang tải dữ liệu hồ sơ...
        </div>
    );

    // const colorRole: Record<string, string> = { BGH: 'magenta', PTCCT: 'blue', VCQL: 'orange', VC: 'default' };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-40" />
                    
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-white shadow-sm font-bold text-3xl">
                            {profile?.ho_va_ten?.charAt(0)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm" title="Active"></div>
                    </div>

                    {/* Name */}
                    <div className="flex-1 text-center md:text-left z-10">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{profile.ho_va_ten}</h1>
                            {/* <Tag color={colorRole[user?.vai_tro]} className="w-fit mx-auto md:mx-0 border-none px-4 py-0.5 rounded-full font-bold uppercase text-[10px] shadow-sm">
                                {user.vai_tro}
                            </Tag> */}
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-y-2 gap-x-5 text-sm">
                            <span className="text-indigo-600 font-bold flex items-center gap-2">
                                <UserOutlined /> {profile.ten_chuc_danh || 'Chuyên viên'}
                            </span>
                            <span className="text-gray-300 hidden md:inline">/</span>
                            <span className="text-gray-500 font-medium flex items-center gap-2">
                                <BankOutlined className="text-gray-400" /> {profile.ten_don_vi}
                            </span>
                        </div>
                    </div>

                    {/* Info */}
                    {profile.ten_chuc_danh && (
                        <div className="bg-slate-50 p-5 rounded-2xl border border-gray-100 text-center md:text-right min-w-55">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 tracking-widest">Nhiệm kỳ hiện tại</p>
                            <p className="text-sm font-bold text-gray-700">
                                {format(profile.ngay_bat_dau)} <span className="text-gray-300 mx-1">→</span> {profile.ngay_ket_thuc ? format(profile.ngay_ket_thuc) : 'Nay'}
                            </p>
                            {profile.so_quyet_dinh && (
                                <p className="text-[11px] text-indigo-500 mt-2 font-bold px-2 py-1 bg-white rounded-lg border border-indigo-50 inline-block">
                                    QĐ: {profile.so_quyet_dinh}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* main content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Section title="Thông tin cá nhân">
                        <div className="grid grid-cols-2 gap-2">
                            <Field icon={<CalendarOutlined />} label="Ngày sinh" value={format(profile.ngay_sinh)} />
                            <Field icon={<UserOutlined />} label="Giới tính" value={profile.gioi_tinh === 1 ? 'Nam' : 'Nữ'} />
                            <Field icon={<IdcardOutlined />} label="Số CCCD" value={profile.so_cccd} />
                            <Field icon={<PhoneOutlined />} label="Điện thoại" value={profile.so_dien_thoai} />
                            <div className="col-span-2">
                                <Field icon={<MailOutlined />} label="Email công vụ" value={profile.email} />
                            </div>
                            <Divider className="col-span-2 my-2 opacity-50" />
                            <Field label="Ngày kết nạp ĐV" value={format(profile.ngay_ket_nap)} />
                            <Field label="Ngày chính thức" value={format(profile.ngay_chinh_thuc)} />
                        </div>
                    </Section>

                    <Section title="Trình độ & Chuyên môn">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="col-span-2 bg-indigo-50/30 rounded-xl mb-2">
                                <Field label="Chuyên môn cao nhất" value={profile.trinh_do_chuyen_mon} />
                            </div>
                            <Field label="Chuyên ngành" value={profile.chuyen_nganh} />
                            <Field label="Năm tốt nghiệp" value={profile.nam_tot_nghiep} />
                            <Field label="Lý luận chính trị" value={profile.trinh_do_ly_luan_CT} />
                            <Field label="Ngoại ngữ" value={profile.trinh_do_ngoai_ngu} />
                            <div className="col-span-2">
                                <Field label="Trình độ Tin học" value={profile.trinh_do_tin_hoc} />
                            </div>
                        </div>
                    </Section>
                </div>
                
              
            </div>
        </div>
    );
}

export default ProfilePage;