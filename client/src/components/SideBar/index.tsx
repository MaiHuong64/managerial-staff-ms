import { useLocation, useNavigate } from "react-router-dom";
import { NAV_ITEMS } from "./SideBar";
import { NavItem } from "./NavItem";
import { useAuth } from "../../hook/useAuth";
import logoAGU from "../../assets/logo/LogoAGU.png";

export const SideBar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const filteredItems = NAV_ITEMS.filter(item => {
        if (!item.roles) return true;
        if (!user) return false;
        return item.roles.includes(user.vai_tro);
    });

    const isActive = (path: string) =>
        location.pathname === path || location.pathname.startsWith(path + "/");

    return (
        <aside className="fixed top-0 left-0 h-screen flex flex-col z-50 w-58 bg-[#0f172a]">

            {/* Logo */}
            <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/5 shrink-0">
                <img src={logoAGU} className="w-8 h-8 rounded-md" />
                <div>
                    <div className="text-sm font-bold text-white leading-tight">AGU</div>
                    <div className="text-[10px] text-slate-400 leading-tight">Quản lý viên chức</div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
                {filteredItems.map((item, idx) => {
                    if (item.section) {
                        return (
                            <div key={`sec-${idx}`} className="px-3 pt-4 pb-1.5 flex items-center gap-2">
                                <div className="h-px flex-1 bg-white/5" />
                                <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-500 shrink-0">
                                    {item.section}
                                </span>
                                <div className="h-px flex-1 bg-white/5" />
                            </div>
                        );
                    }
                    return (
                        <NavItem
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            active={isActive(item.path!)}
                            onClick={() => navigate(item.path!)}
                        />
                    );
                })}
            </nav>

        </aside>
    );
};
