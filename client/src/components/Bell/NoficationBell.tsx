import { useState } from "react";
import { useThongBao } from "../../hook/useThongBao";
import {BellOutlined} from "@ant-design/icons"
import { Badge, Button, List, Popover } from "antd";

export function NoficationBell() {
    const { list, unreadCount, markAsRead, markAllAsRead } = useThongBao();
    const [open, setOpen] = useState(false);

    const content = () => (
        <div className="w-80 max-h-96 overflow-y-auto">
            
            {list.length === 0 ? (
                <div className="p-4 text-center text-gray-500">Chưa có thông báo</div>
            ): (
                <List dataSource={list} renderItem={(tb) => (
                    <List.Item className="cursor-pointer hover: bg-gray-50" onClick={() => markAsRead(tb.id)}>
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