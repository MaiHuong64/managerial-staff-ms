import { useState } from "react";
import { useThongBao } from "../../hook/useThongBao";
import {BellOutlined} from "@ant-design/icons"
import { Badge, Button, List, Popover } from "antd";
import { isCanSuLy } from "../../config/thongBao.config";

export function NoficationBell() {
    const { list, unreadCount, markAllAsRead, handleClickThongBao } = useThongBao();
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<"THONG_TIN" | "CAN_XU_LY">("THONG_TIN");

    
    const dsXuLy = list.filter(isCanSuLy);
    const dsHienThi  = tab === "CAN_XU_LY" ? dsXuLy : list;
    console.log(list.map((tb) => tb.loaiTb));
    console.log("tab:", tab, "dsXuLy:", dsXuLy.length, "dsHienThi:", dsHienThi.length);

    const content = () => (
        <div className="w-80 max-h-96 overflow-y-auto">
            <div className="flex border-b mb-2">
                <button onClick={() => setTab("THONG_TIN")} className={`flex-1 py-2 text-center ${tab === "THONG_TIN" ? "border-b-2 border-blue-500 font-semibold text-blue-500" : "text-gray-500"}`}>Thông tin</button>
                <button onClick={() => setTab("CAN_XU_LY")} className={`flex-1 py-2 text-center ${tab === "CAN_XU_LY" ? "border-b-2 border-blue-500 font-semibold text-blue-500" : "text-gray-500"}`}>Cần xử lý</button>
            </div>
            
            {list.length === 0 ? (
                <div className="p-4 text-center text-gray-500">Chưa có thông báo</div>
            ): (
                <List dataSource={dsHienThi} renderItem={(tb) => (
                    <List.Item className="cursor-pointer hover: bg-gray-50" onClick={() => handleClickThongBao(tb)}>
                        <div className="flex flex-col w-full">
                            <span className={`text-sm ${tb.isRead ? "text-gray-700" : "font-semibold text-gray-900"} `}>{tb.tieuDe}</span>
                            <span className="text-xs text-gray-500 mt-1">{tb.noiDung}</span>
                        </div>
                    </List.Item>
                )}>
                </List>
            )
            }
        </div>
    )

    return (
        <Popover content = {content}
            title={
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">Thông báo</span>
                    {unreadCount > 0 && (
                        <Button type="link" size="small" className="text-sx px-0" onClick={markAllAsRead}>Đánh đấu đã đọc</Button>
                    )}
                </div>
            }
            trigger="click"
            placement="bottomRight"
            open={open}
            onOpenChange={setOpen}>
                
            <Badge count={unreadCount} size="small">
                <Button shape="circle" icon={<BellOutlined />}></Button></Badge>    
        </Popover>
        
    )
}