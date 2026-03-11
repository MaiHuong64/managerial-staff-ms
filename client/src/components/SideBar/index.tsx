import { useLocation, useNavigate } from "react-router-dom"
import { NAV_ITEMS } from "./SideBar";
import { NavItem } from "./NavItem";
import { useAuth } from "../../context/AuthContext"

export const SideBar = () => {
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const filteredItems = NAV_ITEMS.filter(item =>{
        if (item.section) return true;
        if(!user || item.roles) return false;
        // return item.roles.includes(user.vai_tro);
    })

    const isActive = (path: string) => location.pathname === path;
    return(
        <aside className="fixed top-0 left-0 h-screen flex flex-col z-50 w-58 bg-[#111827]">
      
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="flex items-center justify-center rounded-lg bg-[#4f46e5] text-white font-extrabold text-sm w-7 h-7">A</div>
        <div>
            <div className="text-white font-bold text-sm">AGU Portal</div>
            <div className="text-xs text-white/30">Quản lý nhân sự</div>
        </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
            {filteredItems.map((item, idx) => {
            if (item.section) {
                return (
                <div key={`sec-${idx}`} className="px-2 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/20">
                    {item.section}
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

        {/* User Footer */}
        <div className="px-2 pb-3 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 text-white transition-all cursor-pointer">
            <div className="flex items-center justify-center rounded-md bg-[#4f46e5] text-white font-bold w-7 h-7 text-[10px]">
               {user?.ho_va_ten}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{user?.ho_va_ten}</div>
                <div className="text-xs text-white/30 truncate">{user?.vai_tro}</div>
            </div>
            <button 
                onClick={() => { logout(); navigate('/login'); }}
                className="text-white/25 hover:text-white transition-colors"
            >
                ⏻
            </button>
            </div>
        </div>
    </aside>
  );
}