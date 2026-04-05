import { Card, DatePicker, Form, Input } from "antd";
import type React from "react";
import { FileTextOutlined } from "@ant-design/icons";
import type { AuthUser } from "../../../types/auth";

interface Props {
    user: AuthUser | null;
}

export const BatchInfo: React.FC<Props> = ({user}) => {
    return (
        <Card size="small" title={<span><FileTextOutlined className="mr-2 text-blue-500" />Thông tin chung</span>}>
            <Form.Item label="Tên đợt bổ nhiệm" name="ten_dot_bo_nhiem" rules={[{ required: true, message: "Vui lòng nhập tên đợt" }]}>
                <Input placeholder="VD: Đợt bổ nhiệm tháng 3/2026" />
            </Form.Item>
            <Form.Item label="Người lập">
                <Input value={user?.ho_va_ten} disabled />
            </Form.Item>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Form.Item label="Ngày bắt đầu" name="ngay_bat_dau" rules={[{ required: true, message: "Chọn ngày" }]}>
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
                <Form.Item label="Ngày kết thúc" name="ngay_ket_thuc">
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
            </div>
        </Card>
            )
}
export default BatchInfo;