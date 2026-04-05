import React from "react";
import { Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Input from "antd/es/input/Input";

const STATUS_OPTIONS = [
    { value: 2, label: "Hội nghị lãnh đạo (vòng 1)" },
    { value: 3, label: "Hội nghị lãnh đạo (vòng 2)" },
    { value: 4, label: "Hội nghị cán bộ chủ chốt" },
    { value: 5, label: "Hội nghị lãnh đạo (vòng cuối)" },
    { value: 6, label: "Hoàn thành" },
    { value: 0, label: "Đã dừng" },
];

interface Props {
    onSearch: (value: string) => void;
    onFilterChange: (value: number | null) => void;
}

export const AppointmentToolBar: React.FC<Props> = ({ onSearch, onFilterChange }) => (
    <div className="flex items-center gap-3">
        <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Tìm theo tên hoặc mã đợt..."
            allowClear
            style={{ width: 280 }}
            onChange={e => onSearch(e.target.value)}
        />
        <Select
            placeholder="Lọc trạng thái"
            allowClear
            style={{ width: 200 }}
            options={STATUS_OPTIONS}
            onChange={val => onFilterChange(val ?? null)}
        />
    </div>
);

export default AppointmentToolBar;
