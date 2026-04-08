import React from "react";
import LoginForm from "./LoginForm";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-[#f8fafc] overflow-hidden">
      {/* === CỘT TRÁI: BRANDING & ILLUSTRATION === */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0f172a] items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-[#1e293b] to-[#0f172a]" />

        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#2563eb] rounded-full mix-blend-screen filter blur-[120px] opacity-20" />
          <div className="absolute bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-[#3b82f6] rounded-full mix-blend-screen filter blur-[130px] opacity-10" />
        </div>

        <div className="relative z-10 w-full max-w-lg px-12 text-white">
          {/* Logo */}
          <div className="mb-10 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center">
            <span className="text-[#2563eb] font-bold text-3xl tracking-tighter">AGU</span>
          </div>

          {/* Typography */}
          <div className="space-y-6">
            <div>
              <h2 className="text-[#94a3b8] text-sm font-semibold uppercase tracking-widest mb-2">
                Trường Đại học An Giang
              </h2>
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-white">
                Hệ thống Quản lý <br />
                <span className="text-[#60a5fa]">Viên chức</span>
              </h1>
            </div>

            <p className="text-[#cbd5e1] text-lg leading-relaxed font-light max-w-md">
              Nền tảng quản trị nhân sự tập trung, minh bạch và hiệu quả dành cho cán bộ, giảng viên.
            </p>

            {/* SVG Illustration */}
            <div className="pt-8">
              <svg width="340" height="220" viewBox="0 0 340 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="40" width="160" height="140" rx="16" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
                <rect x="24" y="64" width="112" height="12" rx="6" fill="#475569"/>
                <rect x="24" y="92" width="60" height="8" rx="4" fill="#334155"/>
                <rect x="24" y="112" width="80" height="8" rx="4" fill="#334155"/>
                <rect x="24" y="132" width="40" height="8" rx="4" fill="#334155"/>
                <rect x="140" y="20" width="180" height="180" rx="16" fill="#2563eb" fillOpacity="0.08" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.3"/>
                <circle cx="230" cy="80" r="32" fill="#2563eb"/>
                <path d="M216 80L226 90L246 70" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="180" y="132" width="100" height="12" rx="6" fill="#3b82f6" fillOpacity="0.5"/>
                <rect x="200" y="156" width="60" height="8" rx="4" fill="#3b82f6" fillOpacity="0.3"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* === CỘT PHẢI: FORM ĐĂNG NHẬP === */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:w-1/2 lg:px-20 xl:px-32 bg-[#f8fafc]">
        <div className="mx-auto w-full max-w-md">

          {/* Mobile Header */}
          <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
            <div className="w-12 h-12 bg-[#2563eb] rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl tracking-tighter">AGU</span>
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-[#0f172a] leading-none">Đại học An Giang</h2>
              <p className="text-[#64748b] text-xs font-medium mt-1 uppercase tracking-wider">Hệ thống quản lý</p>
            </div>
          </div>

          {/* Form Container (Card) */}
          <div className="bg-white px-8 py-10 rounded-xl shadow-sm border border-[#e2e8f0]">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl font-bold text-[#0f172a] mb-2">Đăng nhập</h2>
              <p className="text-sm text-[#64748b]">
                Vui lòng nhập tên đăng nhập và mật khẩu được cấp để truy cập hệ thống quản trị.
              </p>
            </div>
            <LoginForm />
          </div>

          <div className="text-center text-xs text-[#64748b] mt-8 font-medium">
            &copy; {new Date().getFullYear()} Trường Đại học An Giang.<br className="lg:hidden" />
            <span className="hidden lg:inline"> - </span> Hệ thống quản lý viên chức.
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
