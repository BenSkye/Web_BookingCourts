import { Button, Card, Col, Row, message } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { getPriceFormStartToEnd } from "../../../../services/slotBookingAPI";
import { formatPrice } from "../../../../utils/priceFormatter";
import {
  UpdateBookingDecreasePrice,
  UpdateBookingIncreasePrice,
} from "../../../../services/bookingAPI/bookingAPI";
import { useNavigate } from "react-router-dom";
export default function CartBooking({ oldBooking, newBooking }) {
  console.log("oldBooking", oldBooking);
  const [oldPrice, setOldPrice] = useState(0);
  const [newBookingCart, setNewBookingCart] = useState(null);
  const [updatePrice, setUpdatePrice] = useState(0);
  const getOldPrice = async (centerId, startTime, duration) => {
    const data = await getPriceFormStartToEnd(centerId, startTime, duration);
    setOldPrice(data.price);
  };
  useEffect(() => {
    getOldPrice(oldBooking.centerId, oldBooking.start, oldBooking.end);
  }, [oldBooking]);
  useEffect(() => {
    setNewBookingCart(newBooking);
    if (newBooking !== null) {
      setUpdatePrice(newBooking.price - oldPrice);
    }
    console.log("newBooking", newBooking);
  }, [newBooking]);
  const handleRemoveNewBooking = () => {
    setUpdatePrice(0);
    setNewBookingCart(null);
  };
  const navigate = useNavigate();
  const handleUpdateBooking = async () => {
    if (newBookingCart !== null) {
      if (updatePrice > 0) {
        const updateBooking = {
          _id: oldBooking._id,
          centerId: newBookingCart.centerId,
          start: newBookingCart.start,
          end: newBookingCart.end,
          courtId: newBookingCart._id,
          price: newBookingCart.price,
          date: newBookingCart.date,
          userId: oldBooking.userId,
        };
        const data = { oldPrice: oldPrice, updateBooking: updateBooking };

        console.log("dataToUpdate", data);
        const result = await UpdateBookingIncreasePrice(data);
        console.log("resultIncartBooking", result);
        if (result && result?.data?.paymentResult?.payUrl) {
          console.log(
            "Resultresult.data.paymentResult.payUrl",
            result.data.paymentResult.payUrl
          );
          window.location.href = result.data.paymentResult.payUrl;
        }
      }
      if (updatePrice < 0) {
        const updateBooking = {
          _id: oldBooking._id,
          centerId: newBookingCart.centerId,
          start: newBookingCart.start,
          end: newBookingCart.end,
          courtId: newBookingCart._id,
          price: newBookingCart.price,
          date: newBookingCart.date,
          userId: oldBooking.userId,
        };
        const data = { oldPrice: oldPrice, updateBooking: updateBooking };
        console.log("dataToUpdate", data);
        const result = await UpdateBookingDecreasePrice(data);
        message.success("Đã cập nhật đặt sân thành công");
        navigate("/user/booking-court");
      }
    }
    // không hoàn tiền
  };
  return (
    <div>
      <div>
        <p>Giờ chơi cũ</p>
        <Row>
          <Col span={12}>
            <Row>
              <strong>Sân {oldBooking.courtNumber}</strong>
            </Row>
            <Row>
              {" "}
              <strong>
                {oldBooking.start} - {oldBooking.end}
              </strong>
            </Row>
          </Col>
          <Col span={12} style={{ display: "flex", justifyContent: "end" }}>
            Giá: {formatPrice(oldPrice)}đ
          </Col>
        </Row>
      </div>

      <div style={{ marginTop: "20px" }}>
        <p>Giờ chơi mới</p>
        {newBookingCart !== null && (
          <Row>
            <Col span={12}>
              <Row>
                <strong>Sân {newBookingCart.courtNumber}</strong>
              </Row>
              <Row>
                <strong>
                  {newBookingCart.start} - {newBookingCart.end}
                </strong>
              </Row>
            </Col>
            <Col span={12}>
              <Row style={{ display: "flex", justifyContent: "end" }}>
                Giá: {formatPrice(newBookingCart.price)}đ
              </Row>
              <Row style={{ display: "flex", justifyContent: "end" }}>
                {" "}
                <Button
                  type="link"
                  style={{ padding: 0 }}
                  onClick={() => handleRemoveNewBooking()}
                >
                  Xóa
                </Button>
              </Row>
            </Col>
          </Row>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <p>Giá chênh lệch</p>
        {updatePrice !== 0 ? (
          <>
            <Row style={{ display: "flex", justifyContent: "end" }}>
              {formatPrice(updatePrice)}đ
            </Row>
            <Row
              style={{ color: "red", display: "flex", justifyContent: "end" }}
            >
              {updatePrice < 0 ? (
                <>Bạn sẽ không được hoàn tiền nếu chọn khung giờ rẻ hơn</>
              ) : null}
            </Row>
          </>
        ) : null}
      </div>
      <div style={{ marginTop: "20px" }}>
        <Row>
          <Col span={15}></Col>
          <Col>
            <Button type="primary" onClick={() => handleUpdateBooking()}>
              Xác nhận
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
}
