import type React from "react";

type ColorKey = "indigo" | "amber" | "sky" | "emerald" | "red";

const COLORS: Record<ColorKey, { bg: string; icon: string; value: string; activeBorder: string }> = {
    indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", value: "text-indigo-700", activeBorder: "border-indigo-300" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", value: "text-amber-700", activeBorder: "border-amber-300" },
    sky: { bg: "bg-sky-50", icon: "text-sky-600", value: "text-sky-700", activeBorder: "border-sky-300" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", value: "text-emerald-700", activeBorder: "border-emerald-300" },
    red: { bg: "bg-red-50", icon: "text-red-600", value: "text-red-700", activeBorder: "border-red-300" },
}; 

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color?: ColorKey;
    onClick?: () => void;
    active?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    color = "indigo",
    onClick,
    active = false,
}) => {
    const c = COLORS[color];
    return (
        <div
            onClick={onClick}
            className={`
                bg-white rounded-xl p-5 shadow-sm border transition-all duration-150
                ${active ? `${c.activeBorder} shadow-md` : "border-slate-100"}
                ${onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""}
            `}
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${c.bg}`}>
                    <span className={`text-xl leading-none ${c.icon}`}>{icon}</span>
                </div>
                <div>
                    <div className={`text-2xl font-bold leading-tight ${c.value}`}>{value}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{title}</div>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
