import React, { useContext, useState } from "react";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Row,
  Col,
  Typography,
  message,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png"; // Chỉnh lại đường dẫn cho phù hợp với cấu trúc thư mục của bạn
import Oauth from "../../components/Oauth/Oauth";
import AuthContext from "@/services/authAPI/authProvideAPI";

const { Text } = Typography;

const Login = () => {
  const [registerClicked, setRegisterClicked] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const onFinish = async (values) => {
    try {
      const user = await login(values.email, values.password);
      if (user) {
        console.log(user);
        if (user.role === "manager") {
          navigate("/courtManage");
        } else {
          navigate(-1);
        }
      } else {
        message.error("Email hoặc mật khẩu không đúng!");
      }
    } catch (error) {
      message.error("Email hoặc mật khẩu không đúng!");
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
      <Col
        xs={0}
        sm={0}
        md={12}
        lg={8}
        xl={6}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </Col>
      <Col xs={24} sm={24} md={12} lg={8} xl={6}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1>Đăng nhập</h1>
        </div>
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          style={{ maxWidth: 400, margin: "auto" }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: registerClicked,
                message: "Vui lòng nhập email!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              {
                required: registerClicked,
                message: "Vui lòng nhập mật khẩu!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="remember"
            valuePropName="checked"
            wrapperCol={{ offset: 8, span: 16 }}
          >
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              onClick={() => setRegisterClicked(true)}
              style={{
                backgroundColor: "black",
                borderColor: "black",
                color: "white",
                width: "100%",
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Oauth />
          </Form.Item>
        </Form>
        <div style={{ textAlign: "center" }}>
          <Text>
            Bạn chưa có tài khoản thành viên?{" "}
            <Link to="/signup">Đăng ký làm thành viên</Link>
          </Text>
          <br />
          <Text>
            Bạn muốn làm cộng tác viên?{" "}
            <Link to="/signupPartner">Đăng ký làm cộng tác viên</Link>
          </Text>
        </div>
      </Col>
    </Row>
  );
};

export default Login;
