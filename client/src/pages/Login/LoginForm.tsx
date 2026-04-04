import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Checkbox } from 'antd';
import type { AuthUser, LoginType } from '../../types/auth';
import { useAuth } from '../../hook/useAuth';
import { login as loginApi } from '../../api/auth.api'; 

const LoginForm: React.FC = () => {
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();
    
    const {login} = useAuth();
  
    const onFinish = async (values: LoginType) => {
        setLoading(true);
      
        try{
            const response = await loginApi(values.ten_dang_nhap, values.mat_khau);
            console.log(values.ten_dang_nhap, values.mat_khau)
            const {token, ...userData} = response.data.data;
            localStorage.setItem('token', token);
        
            login(userData as AuthUser, token);
            message.success("Login successful!");
            navigate("/dashboard", { replace: true });
        }
        catch(error: unknown){
            console.log("Full error:", error);
            const err = (error as { response?: { data?: { message?: string } } }).response?.data?.message ||"Đăng nhập thất bại.";
            message.error(err);
        }
        finally{setLoading(false)}
    }
    return(
        <>
        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item label="Tên đăng nhập" name="ten_dang_nhap" rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}>
            <Input placeholder="Nhập tên đăng nhập" />
        </Form.Item>

        <Form.Item label="Mật khẩu" name="mat_khau" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
            <Input.Password placeholder="••••••••••" autoComplete="current-password" />
        </Form.Item>

        <div className="flex justify-between items-center mb-6">
            <Checkbox className="text-[12px] font-medium text-slate-300 hover:text-slate-700 transition-colors">
                Ghi nhớ tôi
            </Checkbox>
        </div>

        <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" block loading={loading}>
                {loading ? "Đang xác thực..." : "Đăng nhập"}
            </Button>
        </Form.Item>
        </Form>
        </>
    )
};
export default LoginForm