import { Button, Modal } from "antd";
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
    <div style={{ marginTop: 20, textAlign: "center" }}>
      <Button
        style={{
          marginBottom: "10px",
          background:
            "linear-gradient(90deg, rgba(252,148,69,1) 0%, rgba(131,58,180,1) 100%)",
          color: "black",
          width: "100%",
          maxWidth: "400px",
          margin: "0 auto",
        }}
        onClick={() => showModal()}
      >
        Xem các Giải đấu mà bạn đã tạo
      </Button>
      <Link to="/tournament/create">
        <Button
          style={{
            marginTop: "10px",
            background:
              "linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(69,252,136,1) 100%)",
            color: "black",
            width: "100%",
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          Tiến hành đăng ký tạo giải đấu
        </Button>
      </Link>

      <Modal
        title="Giải đấu bạn đã tạo"
        visible={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <PersonalTournament />
      </Modal>
    </div>
  );
}
