import React from "react";
import { Form, Checkbox, Row, Col, Card } from "antd";
import {
  FaCar,
  FaHome,
  FaWifi,
  FaStore,
  FaRestroom,
  FaCoffee,
  FaTools,
  FaUser,
  FaFirstAid,
  FaShower,
  FaLock,
} from "react-icons/fa";
import { CheckCircleFilled } from "@ant-design/icons";

const services = [
  { value: "Bãi đỗ xe", label: "Bãi đỗ xe", icon: <FaCar /> },
  { value: "Phòng thay đồ", label: "Phòng thay đồ", icon: <FaHome /> },
  { value: "Wifi miễn phí", label: "Wifi miễn phí", icon: <FaWifi /> },
  {
    value: "Quầy bán/thuê đồ thể thao",
    label: "Quầy bán/thuê đồ thể thao",
    icon: <FaStore />,
  },
  { value: "Nhà vệ sinh", label: "Nhà vệ sinh", icon: <FaRestroom /> },
  {
    value: "Quầy bán đồ ăn nhẹ và nước uống",
    label: "Quầy bán đồ ăn nhẹ và nước uống",
    icon: <FaCoffee />,
  },
  { value: "Dịch vụ cho thuê dụng cụ", label: "Dịch vụ cho thuê dụng cụ", icon: <FaTools /> },
  { value: "Dịch vụ huấn luyện", label: "Dịch vụ huấn luyện", icon: <FaUser /> },
  { value: "Dịch vụ sơ cứu, massage", label: "Dịch vụ sơ cứu, massage", icon: <FaFirstAid /> },
  { value: "Phòng tắm", label: "Phòng tắm", icon: <FaShower /> },
  { value: "Tủ đựng đồ cá nhân", label: "Tủ đựng đồ cá nhân", icon: <FaLock /> },
];

const ServicesAndAmenities = ({ selectedServices = [] }) => (
  <Form.Item label="Dịch Vụ và Tiện Ích">
    <Form.Item name="services" initialValue={selectedServices} label="Dịch Vụ">
      <Checkbox.Group style={{ width: "100%" }}>
        <Row gutter={[16, 16]} justify="start">
          {services.map((service) => (
            <Col span={8} key={service.value}>
              <Card style={{ textAlign: "left" }}>
                <Checkbox
                  value={service.value}
                  icon={<CheckCircleFilled style={{ color: '#1890ff' }} />} // Blue checkmark
                >
                  {service.icon} {service.label}
                </Checkbox>
              </Card>
            </Col>
          ))}
        </Row>
      </Checkbox.Group>
    </Form.Item>
  </Form.Item>
);

export default ServicesAndAmenities;
