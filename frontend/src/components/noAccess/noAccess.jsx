import React, { useContext } from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../services/authAPI/authProvideAPI";

const NoAccess = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const handleGoBack = () => {
    if (!user) {
      navigate("/");
    }
    if (user.role === "customer") {
      navigate("/");
    }
    if (user.role === "manager") {
      navigate("/courtManage");
    }
    if (user.role === "admin") {
      navigate("/admin/Dashboard");
    }
  };

  return (
    <Result
      status="403"
      title="403"
      subTitle="Xin lỗi, bạn không có quyền truy cập vào trang này."
      extra={
        <Button type="primary" onClick={handleGoBack}>
          Quay lại
        </Button>
      }
    />
  );
};

export default NoAccess;
