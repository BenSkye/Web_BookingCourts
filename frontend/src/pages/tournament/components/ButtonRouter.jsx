import { Button, Modal, Space } from "antd";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import PersonalTournament from "../components/PersonalTournament";

export default function ButtonRouter() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div
      style={{
        width: "80%",
        height: "90%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Link
        to="/tournament/personal"
        style={{
          flex: 1,
          marginBottom: "10px",
        }}
      >
        <Button
          style={{
            height: "100%",
            width: "100%",
            background:
              "linear-gradient(90deg, rgba(252,148,69,1) 0%, rgba(131,58,180,1) 100%)",
            color: "black",
          }}
        >
          Xem các Giải đấu mà bạn đã tạo
        </Button>
      </Link>
      <Link
        to="/tournament/create"
        style={{
          flex: 1,
        }}
      >
        <Button
          style={{
            height: "100%",
            width: "100%",
            background:
              "linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(69,252,136,1) 100%)",
            color: "black",
          }}
        >
          Tiến hành đăng ký tạo giải đấu
        </Button>
      </Link>

      {/* <Modal
        title="Giải đấu bạn đã tạo"
        open={isModalOpen}
        footer={null}
        onCancel={handleOk}
      >
        <PersonalTournament />
      </Modal> */}
    </div>
  );
}
