import { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Avatar, Dropdown, Space, Button } from "antd";
import { MdArrowDropDown } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { GiTennisCourt } from "react-icons/gi";
import { FaUserPlus } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import { BsCalendarWeek } from "react-icons/bs";
import { TiClipboard } from "react-icons/ti";

import logo from "@/assets/logonew.png";

import AuthContext from "../../../services/authAPI/authProvideAPI";

export default function HeaderLayout() {
  const { user } = useContext(AuthContext);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const logouthander = () => {
    logout();
    navigate("/");
  };
  const itemsManager = [
    //Items for the dropdown Profile
    {
      label: (
        <Link to="/user">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "start",
            }}
          >
            <GiTennisCourt size="20px" />
            <>Thông tin cá nhân</>
          </div>
        </Link>
      ),
      key: "0",
    },
    {
      label: (
        <Link to="/courtManage">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "start",
            }}
          >
            <GiTennisCourt size="20px" />
            <>Sân của bạn</>
          </div>
        </Link>
      ),
      key: "1",
    },
    {
      label: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
          }}
          onClick={logouthander}
        >
          <CiLogout size="20px" />
          <>Đăng xuất</>
        </div>
      ),
      key: "2",
    },
  ];
  const itemsCustomer = [
    //Items for the dropdown Profile
    {
      label: (
        <Link to="/user">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "start",
            }}
          >
            <GiTennisCourt size="20px" />
            <>Thông tin cá nhân</>
          </div>
        </Link>
      ),
      key: "0",
    },
    {
      label: (
        <Link to="/">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "start",
            }}
          >
            <BsCalendarWeek size="20px" />
            <>Đặt sân của tôi</>
          </div>
        </Link>
      ),
      key: "1",
    },
    {
      label: (
        <Link to="/">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "start",
            }}
          >
            <TiClipboard size="20px" />
            <>Danh sách giao dịch</>
          </div>
        </Link>
      ),
      key: "2",
    },
    {
      label: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
          }}
          onClick={logouthander}
        >
          <CiLogout size="20px" />
          <>Đăng xuất</>
        </div>
      ),
      key: "3",
    },
  ];

  const items = user?.role === "manager" ? itemsManager : itemsCustomer;
  const menuItemsUser = [
    {
      key: "1",
      label: "Tìm sân",
      path: "/",
    },
    { key: "2", label: "Giới thiệu", path: "/aboutUs" },
    { key: "3", label: "Đăng kí đối tác", path: "/partner" },
    { key: "4", label: "Đăng kí giải", path: "/tournament" },
    { key: "5", label: "Đăng kí gói", path: "/registerPackageCourt" },
  ];
  const menuItemsManager = [
    { key: "1", label: "Tổng quan", path: "/courtManage/Dashboard" },
    { key: "2", label: "Lịch hoạt động", path: "/" },
    { key: "3", label: "Yêu cầu tổ chức giải", path: "/" },
    { key: "4", label: "Thông tin sân", path: "/" },
    { key: "5", label: "Tìm sân", path: "/" },
  ];
  const menuItems = user?.role === "manager" ? menuItemsManager : menuItemsUser;

  const [selectedKey, setSelectedKey] = useState("");
  const location = useLocation();
  useEffect(() => {
    // Lấy đường dẫn hiện tại từ useLocation và tìm kiếm nó trong menuItems
    const selectedItem = menuItems.find(
      (item) => item.path === location.pathname
    );
    if (selectedItem) {
      setSelectedKey(selectedItem.key); // Nếu tìm thấy, đặt selectedKey tương ứng
    }
  }, [location.pathname, menuItems]);
  return (
    <>
      <>
        <img
          width={60}
          height={60}
          src={logo}
          className="demo-logo"
          style={{ margin: "4px 4px" }}
        />
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: "24px",
            background: "#141414",
          }}
        >
          {menuItems?.map((item) => (
            <Menu.Item key={item.key} style={{ color: "white" }}>
              <Link to={item.path}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>
      </>
      {user ? (
        <Dropdown
          menu={{
            items,
          }}
        >
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              <Avatar
                size="large"
                src="https://api.dicebear.com/7.x/miniavs/svg?seed=1"
                style={{ background: "white", height: "50px", width: "50px" }}
              />
              <MdArrowDropDown
                style={{ display: "flex", alignItems: "center" }}
                color="white"
                size="30px"
              />
            </Space>
          </a>
        </Dropdown>
      ) : (
        <div style={{ display: "flex" }}>
          <Link to="/login" style={{ paddingRight: "20px" }}>
            <Button
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "start",
              }}
            >
              <CgProfile size="20px" />
              <>Đăng nhập</>
            </Button>
          </Link>
          <Link to="/signup">
            <Button
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "start",
              }}
            >
              <FaUserPlus size="20px" />
              <>Đăng ký</>
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}