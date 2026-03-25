import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axiosClient from '../../utils/AxiosClient'; 

export interface PersonnelData {
    chi_tiet_bn_id: number;
    ho_va_ten: string;
    ten_chuc_danh: string;
    ten_don_vi: string;
}

interface SelectPersonnelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (selectedData: PersonnelData[]) => void;
}

const SelectCandidateModal: React.FC<SelectPersonnelModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [danhSachDat, setDanhSachDat] = useState<PersonnelData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    // State lưu trữ các ID được chọn (Ant Design dùng React.Key cho rowKey)
    const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchDanhSachDat();
        } else {
            // Xóa rỗng danh sách đã chọn khi đóng popup
            setSelectedIds([]); 
        }
    }, [isOpen]);

    const fetchDanhSachDat = async () => {
        setIsLoading(true);
        try {
            const res = await axiosClient.get('/passedCandidate'); 
            
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
        const selectedData = danhSachDat.filter(ns => selectedIds.includes(ns.chi_tiet_bn_id));
        onConfirm(selectedData); 
    };
    const columns: ColumnsType<PersonnelData> = [
        {
            title: 'Họ và tên',
            dataIndex: 'ho_va_ten',
            key: 'ho_va_ten',
            render: (text) => <span className="font-medium text-blue-600">{text}</span>,
        },
        {
            title: 'Chức danh',
            dataIndex: 'ten_chuc_danh',
            key: 'ten_chuc_danh',
        },
        {
            title: 'Đơn vị',
            dataIndex: 'ten_don_vi',
            key: 'ten_don_vi',
        },
    ];

    // 4. Cấu hình chức năng Checkbox (rowSelection)
    const rowSelection = {
        selectedRowKeys: selectedIds,
        onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedIds(newSelectedRowKeys); // Cập nhật state khi người dùng tick chọn
        },
    };

    return (
        <Modal
            title="Chọn Nhân Sự Đạt Chuẩn (Bước 5)"
            open={isOpen} // Antd Modal dùng "open" thay vì "visible"
            onCancel={onClose}
            width={800}
            destroyOnClose
            // Tùy chỉnh 2 nút bấm ở dưới cùng của Modal
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
                rowKey="chi_tiet_bn_id" 
                rowSelection={rowSelection} // Bật tính năng ô checkbox
                columns={columns}
                dataSource={danhSachDat}
                loading={isLoading}
                pagination={{ pageSize: 8 }} // Tự động phân trang 8 người/trang cho gọn
                size="middle"
                bordered
            />
        </Modal>
    );
};

export default SelectCandidateModal;