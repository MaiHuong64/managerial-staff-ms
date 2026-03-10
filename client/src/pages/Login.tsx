import React from "react";
import { ConfigProvider } from "antd";
import { customTheme } from "../theme";
import LoginForm from "../components/LoginForm";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-[780px] bg-white rounded-[20px] overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Cột trái – ảnh */}
        <div className="hidden md:flex bg-[#eef2ff] flex-col items-center justify-center p-12 gap-2 border-r border-indigo-50">
          <img
            src="https://i.pinimg.com/736x/d8/5f/83/d85f83b18bad6afadadbed8b9fae052d.jpg"
            alt="AGU"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Cột phải – form */}
        <div className="flex flex-col justify-center px-10 py-12">
          <div className="mb-8">
            <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-2">
              Trường Đại Học An Giang
            </p>
            <h1 className="text-2xl font-bold text-gray-800 leading-snug">
              Đăng{" "}
              <span className="italic font-normal text-slate-400">nhập</span>
            </h1>
          </div>

          <ConfigProvider theme={customTheme}>
            <LoginForm />
          </ConfigProvider>

          <div className="mt-8 text-xs text-slate-300 text-center">
            © 2026 AGU - Hệ thống quản lý nhân sự
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;