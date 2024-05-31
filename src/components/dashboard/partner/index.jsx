import React, { useState } from "react";
import { Form, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { submitForm } from "../../../services/partnerAPI/index.js";
import PersonalInfo from "./components/PersonalInfo.jsx";
import CourtInfo from "./components/CourtInfo";
import CourtImages from "./components/CourtImages";
import ServicesAndAmenities from "./components/ServicesAndAmenities";
import HoursAndPricing from "./components/HoursAndPricing";
import AdditionalInfo from "./components/AdditionalInfo";
import { getBase64 } from "./components/fileUtils";

function Partner() {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setSubmitting(true);
    const images = await Promise.all(
      fileList.map((file) => getBase64(file.originFileObj))
    );
    const updatedValues = {
      ...values,
      approvalStatus: "Chờ đợi phê duyệt",
      paymentStatus: "Chờ thanh toán",
    };

    submitForm(updatedValues)
      .then(() => {
        message.success("Form submitted successfully!");
        navigate("/courtManage");
      })
      .catch((error) => {
        message.error("There was an error submitting the form");
        console.error(error);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
    form.setFieldsValue({ images: fileList });
  };

  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
    }
    return isImage ? true : Upload.LIST_IGNORE;
  };

  return (
    <div className="App">
      <h1>Đăng ký trở thành cộng tác viên</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ services: [], courtType: [], paymentMethods: [] }}
      >
        <PersonalInfo />
        <CourtInfo />
        <CourtImages
          handleUploadChange={handleUploadChange}
          handleBeforeUpload={handleBeforeUpload}
        />
        <ServicesAndAmenities />
        <HoursAndPricing />
        <AdditionalInfo />
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="submit-btn"
            disabled={submitting}
          >
            Hoàn thành (tạo sân cầu lông đầu tiên của bạn)
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Partner;
