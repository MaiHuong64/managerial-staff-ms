import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../../utils/AxiosClient";
import type {DotBoNhiem } from "../../types/BoNhiem";
import {EyeOutlined, SearchOutlined} from '@ant-design/icons';
import { Button, Card, Input, Table, Tag } from "antd";
import { useNavigate } from "react-router-dom";

export const AppointmentPage: React.FC = () => {
    const [appointments, setAppointments] = useState<DotBoNhiem[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    // const [isModalOpen, setIsModalOpen] = useState(false);
     
    const filterSearch = useMemo( ()=> {
        if(!searchText?.trim()) return appointments;
        return appointments.filter((item)  => item.ten_dot_bo_nhiem.toLowerCase().includes(searchText.toLowerCase()));
    }, [appointments, searchText]);
 
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () =>{
        setLoading(true);
        try {
            const res = await axiosClient.get("/appointments");
            setAppointments(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
    
    const renderStatus = (status: number) => {
    switch (status) {
        case 1: return <Tag>Chọn ứng viên</Tag>;
        case 2: return <Tag color="processing">Đang vote</Tag>;
        case 3: return <Tag color="warning">Lập phương án</Tag>;
        case 4: return <Tag color="success">Đã duyệt</Tag>;
        case 7: return <Tag color="red">Thất bại</Tag>;
        default: return <Tag>Không xác định</Tag>;
    }
    };
    const cols = [
        {
            title: 'Mã / Tên đợt',
            dataIndex: 'ten_dot_bo_nhiem',
            key: 'ten_dot_bo_nhiem',
        },
        {
            title: "Tên chức danh",
            dataIndex: "ten_chuc_danh",
            key: 'ten_chuc_danh'
        },  
        {
            title: "Tên đơn vị",
            dataIndex: "ten_don_vi",
            key: 'ten_don_vi'
        },
        {
            title: 'Số lượng nhân sự',
            dataIndex: 'so_luong_de_xuat',
            key: 'so_luong_de_xuat'
        },
        {
            title: "Trạng thái",
            render: (_:unknown , record: DotBoNhiem) => renderStatus(record.trang_thai)
        },
        {
            title: "Action",
            key: 'action',
            render: (_: unknown, record: DotBoNhiem) => {
                return (
                    <Button type="primary" ghost icon={<EyeOutlined />} onClick={() => navigate(`/appointments/${record.id}`)}>Xem</Button>
                )
            }
        }
    ]
    
    return (
        <>
        <div className="p-8 space-y-6 bg-gray-50 max-h-screen">
            {/* Header */}
            <div className="text-2xl font-bold text-gray-600">DANH SÁCH ĐỢT BỔ NHIỆM</div>
            <p className="text-sm text-gray-200 ">QUẢN LÝ CÁC DỢT BỔ NHIỆM</p>
        </div>
        <Card variant={"borderless"} className="shadow-sm rounded-xl">
            <div className="mb-4 w-full md:w-1/2">
                <Input size="large" prefix={<SearchOutlined className="text-gray-50"/>} placeholder="Tìm kiếm theo đợt bổ nhiệm" onChange={(e) => setSearchText(e.target.value)}></Input>
            </div>
        </Card>
        <Table dataSource={filterSearch} columns={cols} rowKey="id" loading={loading} bordered size="middle"pagination={{ pageSize: 10 }}/>
        </>
    )
}
export default AppointmentPage;