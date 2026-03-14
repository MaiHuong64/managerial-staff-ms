import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "../utils/AxiosClient";
import { Form, Input, Button, message, Checkbox } from 'antd';
import type { LoginType } from '../types/auth';
import { useAuth } from '../hook/useAuth';

const Login: React.FC = () => {
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();
    
    const {login} = useAuth();
  
    const onFinish = async (values: LoginType) => {
        setLoading(true);
      
        try{
            const response = await axios.post('/login', values);
            const token = response.data.data.token;
            localStorage.setItem('token', token);
        
            // get profile user when user login
            const profile = await axios.get('/staff/profile');

            const fullData = profile.data.data;

            await login(fullData, token)
            // console.log("User",fullData);
            // console.log(`Role: ${fullData.vai_tro}`)
            message.success("Login successful!");
            navigate("/dashboard", {replace: true});
        // if(response.status === 200){
        //     const userData = response.data.user;
        //     const token = response.data.token;
        //     login(userData, token);
        //     message.success("Login successful!");
        //     navigate("/dashboard");
        //     }
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
export default Login