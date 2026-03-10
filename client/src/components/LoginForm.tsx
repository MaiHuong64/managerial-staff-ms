import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "../utils/AxiosClient";
import { Form, Input, Button, message, Checkbox } from 'antd';
import type User from '../types/auth';

const Login: React.FC = () => {
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const onFinish = async (values: User) => {
        setLoading(true);
        console.log("Gửi lên API:", {
        username: values.ten_dang_nhap,
        password: values.mat_khau,
        });
        try{
            const response = await axios.post('/login', {
            ten_dang_nhap: values.ten_dang_nhap,
            mat_khau: values.mat_khau,
            
        });
        if(response.status === 200){
            localStorage.setItem('token', response.data.user.token);
            message.success("Login successful!");
            navigate("/dashboard");
            }
        }
        catch(error: unknown){
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
            <Input.Password placeholder="••••••••••"/>
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
export default Login