import { Avatar, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hook/useAuth";
import { NAV_ITEMS, ROLE_LABEL, ROLE_AVATAR } from "../SideBar/SideBar";

const getPageTitle = (pathname: string): string => {
    const matched = NAV_ITEMS.find(item => item.path === pathname);
    return matched?.label ?? "Dashboard";
};

export const TopBar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems: MenuProps["items"] = [
        {
            key: "info",
            label: (
                <div className="px-1 py-1">
                    <div className="font-semibold text-gray-800">{user?.hoVaTen ?? "—"}</div>
                    <div className="text-xs text-gray-400">{user ? ROLE_LABEL[user.vaiTro] : ""}</div>
                </div>
            ),
            disabled: true,
        },
        { type: "divider" },
        {
            key: "profile",
            icon: <UserOutlined />,
            label: "Xem hồ sơ",
            onClick: () => navigate("/profile"),
        },
        { type: "divider" },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
            danger: true,
            onClick: () => {
                if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
                    logout();
                    navigate("/login"); 
                }
            },
        },
    ];

    return (
        <header className="fixed top-0 left-58 right-0 z-40 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
            <span className="text-sm font-semibold text-gray-700 tracking-wide">
                {getPageTitle(location.pathname)}
            </span>

            <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={["click"]}>
                <div className="flex items-center gap-2 cursor-pointer select-none group">
                    <Avatar
                        className="bg-indigo-600 text-white font-bold"
                        size={34}
                    >
                        {user ? ROLE_AVATAR[user.vaiTro] : "?"}
                    </Avatar>
                    <div className="hidden sm:flex flex-col leading-tight">
                        <span className="text-xs font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">
                            {user?.hoVaTen ?? "—"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                            {user ? ROLE_LABEL[user.vaiTro] : ""}
                        </span>
                    </div>
                </div>
            </Dropdown>
        </header>
    );
};
