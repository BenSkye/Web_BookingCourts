// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import AccountSettingsForm from "../accountInformation/index";
import UpdatePassword from "../updatePassword/index";
import OrderDetails from "../bill/index";
import BookingCourt from "../bookingCourt/index";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LockOutlined,
  BookOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import AuthContext from "../../../services/authAPI/authProvideAPI";
// import AuthContext from "../../../services/authAPI/authProvideAPI";

const { Sider, Content } = Layout;

const ProfileAccount = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1");
  const [isCustomer, setIsCustomer] = useState(false); // State để xác định vai trò của người dùng
  const { user } = useContext(AuthContext);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const location = useLocation();

  useEffect(() => {
    // Simulate determining user role (replace with your actual logic)
    const userRole = "admin, manager"; // Change this to 'customer', 'admin', 'manager' based on your logic

    // Set isCustomer based on userRole
    if (user.role === "customer") {
      setIsCustomer(true);
    }

    // Determine the selected key based on the current pathname
    setSelectedKey(getSelectedKey(location.pathname));
  }, [location.pathname]);

  const getSelectedKey = (pathname) => {
    switch (pathname) {
      case "/user/my-account":
        return "1";
      case "/user/update-password":
        return "2";
      case "/user/booking-court":
        return "3";
      case "/user/game-time":
        return "4";
      case "/user/bill":
        return "5";
      default:
        return "1"; // Default to "1" for other routes
    }
  };

  const handleClick = (e) => {
    setSelectedKey(e.key); // Update the selected key on menu click
  };

  return (
    <Layout style={{ minHeight: "100vh", maxWidth: "100%" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{ marginTop: "60px" }}
          onClick={handleClick}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
              color: "#fff",
            }}
          />
          <Menu.Item key="1" icon={<UserOutlined />}>
            <Link to="/user/my-account">Tài khoản của tôi</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<LockOutlined />}>
            <Link to="/user/update-password">Cập nhật mật khẩu</Link>
          </Menu.Item>
          {isCustomer && (
            <>
              <Menu.Item key="3" icon={<BookOutlined />}>
                <Link to="/user/booking-court">Đặt sân</Link>
              </Menu.Item>
              <Menu.Item key="4" icon={<PlayCircleOutlined />}>
                <Link to="/user/game-time">Số giờ chơi</Link>
              </Menu.Item>
            </>
          )}
          <Menu.Item key="5" icon={<FileTextOutlined />}>
            <Link to="/user/bill">Hóa đơn</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            border: "2px solid #d9d9d9",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ width: "100%", maxWidth: "800px" }}>
            {selectedKey === "1" && <AccountSettingsForm />}
            {selectedKey === "2" && <UpdatePassword />}
            {selectedKey === "3" && <BookingCourt />}
            {selectedKey === "4" && <h1>Số giờ chơi</h1>}
            {selectedKey === "5" && <OrderDetails />}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProfileAccount;
