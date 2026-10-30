import { useEffect, useState } from "react";
import type { ThongBao } from "../types/ThongBao";
import { getMyUnreadCount, getThongBaoList, readAll, readOne } from "../api/thongBao.api";
import { socket } from "../socket/socket";

export const useThongBao = () => {
    const [list, setList] = useState<ThongBao[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);

    const markAllAsRead = async () => {
        if(unreadCount === 0) return;
        setUnreadCount(0);
        setList((prev => prev.map((item => ({...item, isRead: true})))));
        try {
            await readAll();
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái thông tin: ", error);
            
        }
    }

    const markAsRead = async (id: number) => {
        const tb = list.find(item => item.id === id);
        if(!tb || tb.isRead) return;

        setUnreadCount(prev => Math.max(0, prev - 1));
        setList(prev => prev.map(item => item.id === id ? {...item, isRead: true}: item));

        try {
            await readOne(id);

        } catch (error) {
            console.error(`Lỗi khi cập nhật thông báo ${id}:`, error);
        }
    }

   
    
    useEffect(() => {
        let active = true;

        if(!active) return;
        const fetchData = async () => {
            try {
                const [resList, resCount] = await Promise.all([
                    getThongBaoList(), getMyUnreadCount()
                ])
                setList(resList.data.data);
                setUnreadCount(resCount.data.count);
            } catch (error) {
                console.log(error);
            }
        }
        fetchData();

        const onNews = (tb: ThongBao) => {
            setList((prev) => [tb, ...prev].slice(0, 10));
            setUnreadCount((prevCount) => prevCount + 1);
        };

        socket.on("thong-bao", onNews);

        return () => {
            active = false;
            socket.off("thong-bao", onNews);
        };
    }, []);

    return { list, unreadCount, markAllAsRead, markAsRead };
}