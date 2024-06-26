import React, { useState } from 'react';
import { Card, Button, InputNumber } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { addPlayPackage } from '@/services/bookingAPI/bookingAPI'; // Adjust the path as necessary

const BookingFlexibleByPackage = ({ id, onSelectPackage, pricePerHour }) => {
  const [hours, setHours] = useState(10); // Initial state for number of hours, starting with 1 hour
  const { centerId } = useParams();
  const handleSelectPackage = async () => {
    try {
      const response = await addPlayPackage({ centerId, hour: hours });
      console.log("addPlayPackage Response:", response);

      if (response.status === 'success') {
        message.success('Tạo gói chơi thành công');

      } else if (response.message === 'Vui lòng đăng nhập để truy cập') {
        message.error('Vui lòng đăng nhập để truy cập');
        history.push('/login');
      } else {
        message.error('Tạo gói chơi thất bại. Vui lòng thử lại.');

      }
    } catch (error) {
      console.error("Error adding play package:", error);
      message.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');

    }
  };

  return (
    <div>
      <h2>Mua gói chơi linh hoạt</h2>
      <Card style={{ marginBottom: '1rem' }}>
        <InputNumber
          min={1}
          defaultValue={1}
          value={hours}
          onChange={value => setHours(value)}
          step={1}
        />

        <Button type='primary' onClick={handleSelectPackage} style={{ marginLeft: '0.5rem' }}>
          <Link to=''>Chọn gói</Link>
        </Button>

      </Card>
    </div>
  );
};

export default BookingFlexibleByPackage;
