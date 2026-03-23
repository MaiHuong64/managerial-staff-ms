import React, { useEffect, useState } from "react";
import axiosClient from "../utils/AxiosClient";
import type { VienChuc } from "../types/VienChuc";
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { Button, Input, Table } from "antd";

export const StaffPage: React.FC = () => {
    const [staffList, setStaffList] = useState<VienChuc[]>([]);
    const [searchText, setSearchText] = useState('');
    // const [setLoading] = useState(true);
    
    useEffect(() => {
        axiosClient.get('/staffs')
        .then(res => setStaffList(res.data.data))
        .catch(console.error);
    }, [])
    if(!staffList) return(
        <div className="flex justify-center items-center h-screen text-gray-400 italic font-light">
            Đang tải dữ liệu viên chức...
        </div>
    )
    const filteredStaff = staffList.filter(s =>
        s.ho_va_ten.toLowerCase().includes(searchText.toLowerCase())
    );

    const cols = [
        {
            title: 'Mã viên chức',
            dataIndex: 'ma_vien_chuc',
            key: 'ma_vien_chuc',
        },
        {
            title: 'Họ và tên',
            dataIndex: 'ho_va_ten',
            key: 'ho_va_ten',
        },
         {
            title: 'Đơn vị',
            dataIndex: 'ten_don_vi',
            key: 'ten_don_vi',
        }, {
            title: 'Chức vụ hiện tại',
            dataIndex: 'chuc_vu_hien_tai',
            render: (val: string) => val || <span className="text-gray-300 italic">null</span>
        },
        {
            title: 'Ngạch',
            dataIndex: 'ngach',
            key: 'ngach',
        },
    ]
    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Danh sách Viên chức Quản lý</h1>
                    <p className="text-sm text-slate-400">Quản lý và theo dõi thông tin nhân sự toàn hệ thống</p>
                </div>
                <Button type="primary" icon={<UserAddOutlined />} className="bg-indigo-600 hover:bg-indigo-700 border-none h-10 px-6 rounded-xl shadow-lg shadow-indigo-100">
                    Thêm viên chức
                </Button>
            </div>

            <div className="bg-white p-4 rounded-2xl flex flex-wrap gap-4 items-center">
                <Input prefix={<SearchOutlined className="text-slate-300" />}
                        placeholder="Nhập tên viên chức"
                        className="max-w-xs rounded-xl border-slate-100"
                        onChange={e => setSearchText(e.target.value)}/>
            </div>

            <div className="bg-white rounded-2xl border-slate-500 overflow-hidden">
               <Table dataSource={filteredStaff} columns={cols}></Table>
            </div>

        </div>
    )
}