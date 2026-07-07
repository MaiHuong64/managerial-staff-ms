import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axiosClient from '../../utils/AxiosClient'; 

export interface PersonnelData {
    chiTietBnId: number;
    hoVaTen: string;
    tenChucDanh: string;
    tenDonVi: string;
}

interface SelectPersonnelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (selectedData: PersonnelData[]) => void;
}

const SelectCandidateModal: React.FC<SelectPersonnelModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [danhSachDat, setDanhSachDat] = useState<PersonnelData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchDanhSachDat();
        } else {
            setSelectedIds([]); 
        }
    }, [isOpen]);

    const fetchDanhSachDat = async () => {
        setIsLoading(true);
        try {
            const res = await axiosClient.get('/phuong-an-nhan-su/ung-vien');
            
            if (res.data.success) {
                setDanhSachDat(res.data.data);
            } else {
                message.warning(res.data.message || 'Không có dữ liệu.');
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách:", error);
            message.error('Lỗi kết nối khi lấy danh sách nhân sự đạt chuẩn.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = () => {
        const selectedData = danhSachDat.filter(ns => selectedIds.includes(ns.chiTietBnId));
        onConfirm(selectedData); 
    };
    const columns: ColumnsType<PersonnelData> = [
        {
            title: 'Họ và tên',
            dataIndex: 'hoVaTen',
            key: 'hoVaTen',
            render: (text) => <span className="font-medium text-blue-600">{text}</span>,
        },
        {
            title: 'Chức danh',
            dataIndex: 'tenChucDanh',
            key: 'tenChucDanh',
        },
        {
            title: 'Đơn vị',
            dataIndex: 'tenDonVi',
            key: 'tenDonVi',
        },
    ];

    const rowSelection = {
        selectedRowKeys: selectedIds,
        onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedIds(newSelectedRowKeys);
        },
    };

    return (
        <Modal
            title="Chọn Nhân Sự Đạt Chuẩn (Bước 5)"
            open={isOpen} 
            onCancel={onClose}
            width={800}
            destroyOnClose
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Hủy bỏ
                </Button>,
                <Button 
                    key="submit" 
                    type="primary" 
                    onClick={handleConfirm} 
                    disabled={selectedIds.length === 0}
                >
                    Xác nhận thêm ({selectedIds.length})
                </Button>,
            ]}
        >
            <Table
                rowKey="chiTietBnId" 
                rowSelection={rowSelection}
                columns={columns}
                dataSource={danhSachDat}
                loading={isLoading}
                pagination={{ pageSize: 8 }}
                size="middle"
                bordered
            />
        </Modal>
    );
};

export default SelectCandidateModal;