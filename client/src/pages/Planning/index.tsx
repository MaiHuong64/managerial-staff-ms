import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../../utils/AxiosClient";
import type { DotQuyHoach } from "../../types/QuyHoach";
import {PlusCircleOutlined, SearchOutlined} from '@ant-design/icons';
import { Button, Card, Input, Table, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { PlanningModal } from "./PlanningModal";

export const PlanningPage: React.FC = () => {
    const [planningList, setPlanningList] = useState<DotQuyHoach[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
     
    const filterSearch = useMemo( ()=> {
        if(!searchText?.trim()) return planningList;
        return planningList.filter((item)  => item.ten_quy_hoach.toLowerCase().includes(searchText.toLowerCase()) || item.nam_thuc_hien.toLocaleString().includes(searchText.toLocaleLowerCase()));
    }, [planningList, searchText]);
 
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () =>{
        setLoading(true);
        try {
            const res = await axiosClient.get("/plannings");
            setPlanningList(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
  

    const cols = [
        {
            title: 'Mã / Tên đợt',
            dataIndex: 'ten_quy_hoach',
            key: 'ten_quy_hoach',
        },
        {
            title: 'Loại quy hoạch',
            dataIndex: 'loai_quy_hoach',
            key: 'loai_quy_hoach',
            render: (val: number) => val === 1 ? (<Tag color={"purple"}>Đầu nhiệm kỳ</Tag>) : (<Tag color={"cyan"}>Rà soát</Tag>)
        },
         {
            title: 'Năm thực hiện',
            dataIndex: 'nam_thuc_hien',
            key: 'nam_thuc_hien',
            sorter: (a: DotQuyHoach,b: DotQuyHoach) => a.nam_thuc_hien - b.nam_thuc_hien
        }, {
            title: 'Nhiệm kỳ',
            dataIndex: 'nhiem_ky',
            render: (val: string) => val || <span className="text-gray-300 italic">null</span>
        },
        {
            title: 'Số người trong QH',
            dataIndex: 'so_luong',
            key: 'so_luong',
            align: "right" as const
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            render: (val: number) => val === 1 ? <Tag color="green">Hoàn thành</Tag> : <Tag color="orange">Đang xử lý</Tag>,
        },
        {
            title: '',
            key: 'action',
            align: 'right' as const,
            render: (_: unknown, record: DotQuyHoach) => (<Button type="link" size="small" style={{ color: "#534AB7" }}
                    onClick={() => navigate(`/plannings/${record.id}`)}>Xem</Button>)
        }
    ]
    
    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-500">Danh sách đợt quy hoạch</h1>
                    <p className="text-sm text-gray-500">Quản lý quy hoạch đợt cán bộ</p>
                </div>
            </div>

             <div className="grid grid-cols-4 gap-4">
                <Card>
                    <div className="text-2xl font-bold">{filterSearch.length}</div>
                    <div className="text-gray-500">Tổng đợt quy hoạch</div>
                </Card>
                <Card>
                    <div className="text-2xl font-bold">{filterSearch.filter(d => d.loai_quy_hoach === 1).length}</div>
                    <div className="text-gray-500">Đầu nhiệm kỳ</div>
                </Card>
                <Card>
                    <div className="text-2xl font-bold">{filterSearch.filter(d => d.loai_quy_hoach === 2).length}</div>
                    <div className="text-gray-500">Rà soát hằng năm</div>
                </Card>
            </div>
        
            <Button type="primary" icon={<PlusCircleOutlined />} className="rounded-2xl" onClick={() => setIsModalOpen(true)}>Tạo đợt quy hoạch</Button>
            <div className="bg-white p-4 rounded-xl shadow-sm flex gap-4">
                <Input prefix={<SearchOutlined />} placeholder="Tìm kiếm..." onChange={(e) => setSearchText(e.target.value)}></Input>
            </div>
            <div className="bg-white rounded-xl shadow">
               <Table dataSource={filterSearch} columns={cols} rowKey={"id"} loading={loading}/>
            </div>
            <PlanningModal 
                open={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchData}
            />
        </div>
    )
}
export default PlanningPage;