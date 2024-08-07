import { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Avatar, Dropdown, Space, Button } from "antd";
import { MdArrowDropDown, MdCheckCircle } from "react-icons/md";
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

  const logouthander = async () => {
    await logout();
    navigate("/");
  };

  const itemsManager = [
    {
      label: (
        <Link to="/user">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "start" }}>
            <GiTennisCourt size="20px" />
            <>Thông tin cá nhân</>
          </div>
        </Link>
      ),
      key: "0",
    },
    {
      label: (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'start',
          }}
          onClick={logouthander}
        >
          <CiLogout size='20px' />
          <>Đăng xuất</>
        </div>
      ),
      key: '1',
    },
  ];

  const itemsAdmin = [
    {
      label: (
        <Link to="/user">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "start" }}>
            <GiTennisCourt size="20px" />
            <>Thông tin cá nhân</>
          </div>
        </Link>
      ),
      key: "0",
    },
    {
      label: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "start" }} onClick={logouthander}>
          <CiLogout size="20px" />
          <>Đăng xuất</>
        </div>
      ),
      key: '1',
    },
  ];

  const itemsCustomer = [
    {
      label: (
        <Link to="/user">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "start" }}>
            <GiTennisCourt size="20px" />
            <>Thông tin cá nhân</>
          </div>
        </Link>
      ),
      key: "0",
    },
    {
      label: (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'start',
          }}
          onClick={logouthander}
        >
          <CiLogout size='20px' />
          <>Đăng xuất</>
        </div>
      ),
      key: "3",
    },
  ];

  const items = user?.role === "manager" ? itemsManager : user?.role === "customer" ? itemsCustomer : itemsAdmin;

  const menuItemsUser = [
    { key: "1", label: "Tìm sân", path: "/" },
    { key: "2", label: "Giới thiệu", path: "/aboutUs" },
    { key: "3", label: "Đăng kí giải", path: "/tournament" },
  ];

  const menuItemsManager = [
    { key: "1", label: "Tổng quan", path: "/courtManage/Dashboard" },
    { key: "2", label: "Lịch hoạt động", path: "/courtManage/ManagerCalendar" },
    { key: "3", label: "Yêu cầu tổ chức giải", path: "/courtManage/RequestToOrganizeATournament" },
    { key: "4", label: "Quản lý sân", path: "/courtManage" },
    { key: "5", label: "Đặt sân trực tiếp", path: "/courtManage/BookingCourtDirectly" },
    { key: "7", label: "Đăng ký sân", path: "/courtManage/partner" },
  ];

  const menuItemsAdmin = [
    { key: "1", label: "Tổng quan", path: "/admin/Dashboard" },
    { key: "2", label: "Quản lý sân", path: "/admin/manageCenter" },
    { key: "3", label: "Quản lý người dùng", path: "/admin/UserManagement" },
    { key: "4", label: "Quản lý người chủ sân", path: "/admin/ManagerManagement" },
  ];

  const menuItems = user?.role === "manager" ? menuItemsManager : user?.role === "admin" ? menuItemsAdmin : menuItemsUser;

  const [selectedKey, setSelectedKey] = useState("");
  const location = useLocation();

  useEffect(() => {
    const selectedItem = menuItems.find((item) => item.path === location.pathname);
    if (selectedItem) {
      setSelectedKey(selectedItem.key);
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
            background: "#f58f00",
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
        <Dropdown menu={{ items }}>
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              {user?.avatar ? (
                <Avatar
                  size='large'
                  src={user?.avatar}
                  style={{ background: 'white', height: '50px', width: '50px' }}
                />
              ) : (
                <Avatar size="large" src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" style={{ background: "white", height: "50px", width: "50px" }} />
              )}
              <MdArrowDropDown style={{ display: "flex", alignItems: "center" }} color="white" size="30px" />
            </Space>
          </a>
        </Dropdown>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Link to="/login" style={{ paddingRight: "20px" }}>
            <Button style={{ display: "flex", alignItems: "center", justifyContent: "start" }}>
              <CgProfile size="20px" />
              <>Đăng nhập</>
            </Button>
          </Link>
          <Link to="/signup" style={{ margin: "0 20px" }}>
            <Button style={{ display: "flex", alignItems: "center", justifyContent: "start" }}>
              <FaUserPlus size="20px" />
              <>Đăng ký</>
            </Button>
          </Link>
          <Link to="/signupPartner">
            <Button style={{ display: "flex", alignItems: "center", justifyContent: "start" }}>
              <FaUserPlus size="20px" />
              <>Đăng ký trở thành cộng tác viên</>
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}
