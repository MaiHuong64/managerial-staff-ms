import React from "react";
import { Table, Tag, Badge } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import type { DanhSachDotBoNhiem } from "../../types/BoNhiem";
import { useNavigate } from "react-router-dom";

interface Props {
    data: DanhSachDotBoNhiem[];
    loading: boolean;
}

const formatDate = (date: string) => 
    date ? new Date (date).toLocaleDateString("vi-VN") : "-"

export const  AppoinmentTable: React.FC<Props> = ({ data, loading }) => {
    const navigate = useNavigate();

    const columns = [
        {
            title: "Đợt bổ nhiệm",
            dataIndex: "tenDotBoNhiem",
            key: "tenDotBoNhiem",
            render: (text: string, record: DanhSachDotBoNhiem) => (
                <div>
                    <div className="font-semibold text-slate-800 text-sm">{text}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{record.maDotBoNhiem}</div>
                </div>
            ),
        },
        {
            title: "Ngày Bắt Đầu",
            dataIndex: "ngayBatDau",
            key: "ngayBatDau",
            width: 126,
            align: "center",
            render: (value: string) => <span>{formatDate(value)}</span>
        },
        {
            title: "Ngày Kết Thúc",
            dataIndex: "ngayKetThuc",
            key: "ngayKetThuc",
            width: 126,
            align: "center",
            render: (value: string) => <span>{formatDate(value)}</span>
        },
        {
            title: "Chức Danh Bổ Nhiệm",
            dataIndex: "tenChucDanh",
            key: "tenChucDanh",
            width: 180,
            align: "center" as const,
        },
        {
            title: "Trạng thái",
            dataIndex: "trangThai",
            key: "trangThai",
            width: 220,
            render: (val: number | null) => {
                const map: Record<number, { label: string; color: string }> = {
                    1: { label: "Chưa bắt đầu", color: "default" },
                    2: { label: "Đang thực hiện", color: "processing" },
                    6: { label: "Hoàn thành", color: "success" },
                    0: { label: "Đã dừng", color: "error" },
                };
                if (val == null) return <Badge status="default" text={<span className="text-slate-400 text-xs">—</span>} />;
                const state = map[val];
                if (!state) return <Tag>—</Tag>;
                return (
                    <Tag color={state.color} className="rounded-full px-3 py-0.5 text-xs font-medium border-0">
                        {state.label}
                    </Tag>
                );
            },
        },
        {
            title: "",
            key: "action",
            width: 48,
            align: "center" as const,
            render: () => (
                <ArrowRightOutlined className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey="id"
            onRow={record => ({
                onClick: () => navigate(`/dot-bo-nhiem/${record.id}`),
                className: "cursor-pointer group hover:bg-slate-50 transition-colors",
            })}
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}–${range[1]} / ${total} đợt`,
            }}
            scroll={{ x: 700 }}
        />
    );
};

export default AppoinmentTable;
