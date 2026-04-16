import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import type { AuthUser, LoginType } from '../../types/auth';
import { useAuth } from '../../hook/useAuth';
import { login as loginApi } from '../../api/auth.api'; 

const LoginForm: React.FC = () => {
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();
    
    const { login } = useAuth();
  
    const onFinish = async (values: LoginType) => {
        setLoading(true);
      
        try {
            const response = await loginApi(values.tenDangNhap, values.matKhau);
            console.log(values.tenDangNhap, values.matKhau);
            const { token, ...userData } = response.data.data;
            localStorage.setItem('token', token);
        
            login(userData as AuthUser, token);
            message.success("Đăng nhập thành công!");
            navigate("/dashboard", { replace: true });
        }
        catch (error: unknown) {
            console.log("Full error:", error);
            const err = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Đăng nhập thất bại.";
            message.error(err);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <Form  form={form}  layout="vertical"  onFinish={onFinish}  requiredMark={false}  className="w-full">
            <Form.Item 
                label={<span className="text-sm font-medium text-[#0f172a]">Tên đăng nhập / Mã viên chức</span>} 
                name="tenDangNhap" 
                rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
            >
                <Input 
                    prefix={<UserOutlined className="text-[#94a3b8] mr-1" />} 
                    placeholder="VD: 002 hoặc email" 
                    className="hover:border-[#2563eb] focus:border-[#2563eb] text-[15px]"
                />
            </Form.Item>

            <Form.Item  label={<span className="text-sm font-medium text-[#0f172a]">
                Mật khẩu</span>}  name="matKhau" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]} className="mb-8">
                <Input.Password 
                    prefix={<LockOutlined className="text-[#94a3b8] mr-1" />}
                    placeholder="Nhập mật khẩu của bạn" 
                    autoComplete="current-password" 
                    className="hover:border-[#2563eb] focus:border-[#2563eb] text-[15px]"
                />
            </Form.Item>

            <Form.Item className="mb-0">
                <Button type="primary" htmlType="submit" block loading={loading}className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-sm border-0 text-[15px] h-11">
                    {loading ? "Đang xác thực..." : "Đăng nhập"}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default LoginForm;