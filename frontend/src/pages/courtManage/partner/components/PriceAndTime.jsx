import React from "react";
import { Form, InputNumber, TimePicker, Checkbox } from "antd";
import moment from "moment";

const CustomForm = ({
  form,
  handleCheckboxChange,
  showGoldenPrice,
  handleByMonthPriceChange,
  showByMonthPrice,
  handleBuyPackageChange,
  showBuyPackage,
}) => {
  const getDisabledHours = (openTime, closeTime) => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      if (i < openTime.hour() || i > closeTime.hour()) {
        hours.push(i);
      }
    }
    return hours;
  };

  const validateGoldenTime = (_, value) => {
    const startTimeGolden = form.getFieldValue("startTimeGolden");
    const endTimeGolden = form.getFieldValue("endTimeGolden");

    if (!startTimeGolden || !endTimeGolden) {
      return Promise.resolve();
    }

    if (startTimeGolden.isAfter(endTimeGolden)) {
      return Promise.reject(new Error("Giờ bắt đầu không được sau giờ kết thúc!"));
    }

    if (endTimeGolden.diff(startTimeGolden, "hours") < 1) {
      return Promise.reject(new Error("Giờ kết thúc phải cách giờ bắt đầu ít nhất 1 giờ!"));
    }
    
    return Promise.resolve();
  };

  const validateStartTimeGolden = (_, value) => {
    const endTimeGolden = form.getFieldValue("endTimeGolden");

    if (!value || !endTimeGolden) {
      return Promise.resolve();
    }

    if (value.isAfter(endTimeGolden)) {
      return Promise.reject(new Error("Giờ bắt đầu không được sau giờ kết thúc!"));
    }

    return Promise.resolve();
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        label="Giá tiền giờ chơi bình thường (ngàn/giờ), giờ chơi bình thường là thời gian mở cửa và đóng cửa của sân"
        name="normalPrice"
        rules={[
          {
            required: true,
            message: "Hãy nhập giá tiền giờ chơi bình thường !",
          },
        ]}
      >
        <InputNumber min={10000} />
      </Form.Item>

      <Form.Item>
        <Checkbox onChange={handleCheckboxChange}>Có giờ vàng</Checkbox>
      </Form.Item>
      {showGoldenPrice && (
        <Form.Item className="time_and_price">
          <Form.Item
            label="Giá giờ vàng (ngàn/giờ) (giờ vàng có giá tiền khác biệt so với giờ chơi bình thường)"
            name="goldenPrice"
            rules={[
              {
                required: showGoldenPrice,
                message: "Hãy nhập giá tiền giờ chơi khung giờ vàng!",
              },
            ]}
          >
            <InputNumber min={10000} />
          </Form.Item>
          <Form.Item
            label="Giờ bắt đầu (giờ vàng)"
            name="startTimeGolden"
            rules={[
              {
                required: showGoldenPrice,
                message: "Hãy chọn giờ bắt đầu",
              },
              {
                validator: validateStartTimeGolden,
              },
            ]}
          >
            <TimePicker
              format={"HH:mm"}
              disabledHours={() =>
                getDisabledHours(
                  form.getFieldValue("openTime"),
                  form.getFieldValue("closeTime")
                )
              }
              disabledMinutes={() => [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
                20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 33, 34, 35, 36, 37,
                38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54,
                55, 56, 57, 58, 59,
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Giờ kết thúc (giờ vàng)"
            name="endTimeGolden"
            rules={[
              {
                required: showGoldenPrice,
                message: "Hãy chọn giờ kết thúc!",
              },
              {
                validator: validateGoldenTime,
              },
            ]}
          >
            <TimePicker
              format={"HH:mm"}
              disabledHours={() =>
                getDisabledHours(
                  form.getFieldValue("openTime"),
                  form.getFieldValue("closeTime")
                )
              }
              disabledMinutes={() => [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
                20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 33, 34, 35, 36, 37,
                38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54,
                55, 56, 57, 58, 59,
              ]}
            />
          </Form.Item>
        </Form.Item>
      )}

      <Form.Item>
        <Checkbox onChange={handleByMonthPriceChange}>
          Có đặt lịch cố định trong tháng
        </Checkbox>
      </Form.Item>
      {showByMonthPrice && (
        <Form.Item className="time_and_price">
          <Form.Item
            label="Đặt lịch cố định trong tháng (ngàn/giờ) (giá tiền cố định trong tháng, không quan trọng giờ)"
            name="byMonthPrice"
            rules={[
              {
                required: showByMonthPrice,
                message: "Hãy nhập giá tiền cố định trong tháng!",
              },
            ]}
          >
            <InputNumber min={10000} />
          </Form.Item>
        </Form.Item>
      )}

      <Form.Item>
        <Checkbox onChange={handleBuyPackageChange}>
          Có mua gói giờ chơi
        </Checkbox>
      </Form.Item>
      {showBuyPackage && (
        <Form.Item className="time_and_price">
          <Form.Item
            label="Mua giờ chơi (giá tiền mua giờ chơi, không quan trọng giờ)"
            name="buyPackagePrice"
            rules={[
              {
                required: showBuyPackage,
                message: "Hãy nhập giá tiền mua giờ chơi!",
              },
            ]}
          >
            <InputNumber min={10000} />
          </Form.Item>
        </Form.Item>
      )}
    </Form>
  );
};

export default CustomForm;
