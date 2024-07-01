import { Button, DatePicker, Form, Input, InputNumber, Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createTournamentAPI } from "../../../services/tournamentAPI/tournamentAPI";

export default function RegistTournamentForm() {
  const centerId = useParams().centerID;
  const [newTournament, setNewTournament] = useState({});
  const onFinish = (values) => {
    values.startDate = dayjs(values.startDate).format("YYYY-MM-DD");
    values.endDate = dayjs(values.endDate).format("YYYY-MM-DD");
    values = { ...values, centerId: centerId };
    console.log("Received values from form: ", values);
    setNewTournament(values);
    showModal();
  };

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const navigate = useNavigate();
  const handleOk = async () => {
    const data = await createTournamentAPI(newTournament);
    console.log("Received values from form: ", { data });
    setIsModalOpen(false);
    navigate(`/tournament/detail/${data._id}`);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <h1>Điền thông tin về giải đấu</h1>
      <Form name="register" onFinish={onFinish} scrollToFirstError>
        <p>Tên tổ chức hoặc cá nhân tổ chức giải đấu</p>
        <Form.Item
          name="fullname"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập tên!",
              whitespace: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <p>Số điện thoại</p>
        <Form.Item
          name="phone"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại!" },
            {
              pattern: /^(\+\d{1,3}[- ]?)?\d{10}$/,
              message: "Số điện thoại không hợp lệ!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <p>Địa chỉ email</p>
        <Form.Item
          name="email"
          rules={[
            {
              type: "email",
              message: "Email không hợp lệ!",
            },
            {
              required: true,
              message: "Vui lòng nhập Email!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <p>Tên giải đấu</p>
        <Form.Item
          name="tournamentName"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập tên giải đấu!",
              whitespace: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <p>Mô tả ngắn gọn về giải đấu</p>
        <Form.Item
          name="description"
          rules={[
            {
              required: true,
              message:
                "Cung cấp mô tả để quản lý sân hiểu thêm về giải đấu cảu bạn!",
              whitespace: true,
            },
          ]}
        >
          <TextArea rows={5} />
        </Form.Item>

        <p>Số lượng vận động viên dự kiến</p>
        <Form.Item
          name="numberOfAthletes"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập số lượng vận động viên dự kiến!",
            },
            {
              pattern: /^\d+$/,
              message: "Nhập số bạn nhé!",
            },
          ]}
        >
          <InputNumber />
        </Form.Item>

        <p>Số lượng trận đấu dự kiến</p>
        <Form.Item
          name="numberOfMatches"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập số trận đấu dự kiến!",
            },
            {
              pattern: /^\d+$/,
              message: "Nhập số bạn nhé!",
            },
          ]}
        >
          <InputNumber />
        </Form.Item>

        <p>Cơ cấu giải thưởng</p>
        <Form.Item name="prizeStructure">
          <TextArea rows={5} />
        </Form.Item>
        <p>Đơn vị tài trợ</p>
        <Form.Item name="sponsor">
          <TextArea rows={5} />
        </Form.Item>

        <p>Ngày bắt đầu</p>
        <Form.Item
          name="startDate"
          rules={[{ required: true, message: "Chọn ngày bắt đầu!" }]}
        >
          <DatePicker
            defaultPickerValue={dayjs().add(7, "day")}
            disabledDate={(current) =>
              current &&
              (current < dayjs().add(7, "day").endOf("day") ||
                (endDate && current > endDate))
            }
            onChange={(date) => setStartDate(date)}
          />
        </Form.Item>

        <p>Ngày kết thúc</p>
        <Form.Item
          name="endDate"
          rules={[{ required: true, message: "Chọn ngày kết thúc!" }]}
        >
          <DatePicker
            defaultPickerValue={dayjs().add(7, "day")}
            disabledDate={(current) =>
              current &&
              (current < dayjs().add(7, "day").endOf("day") ||
                (startDate && current < startDate))
            }
            onChange={(date) => setEndDate(date)}
          />
        </Form.Item>

        <p>Yêu cầu đặc biệt</p>
        <Form.Item name="specialRequests">
          <TextArea rows={5} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
      <Modal
        title="Gửi yêu cầu đặt sân"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>
          Yêu cầu đặt sân sẽ được gửi đi và chờ chủ sân duyệt từ 1 tới 2 ngày
        </p>
      </Modal>
    </>
  );
}
