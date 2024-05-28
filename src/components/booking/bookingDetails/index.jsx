import { useParams } from 'react-router-dom';
import { Tabs } from 'antd';
import BookingByDate from '@/components/booking/bookingDetails/bookingByDate';
import BookingFixedByMonth from '@/components/booking/bookingDetails/bookingFixedByMonth';

const { TabPane } = Tabs;

export default function BookingDetail() {
  const { id } = useParams(); // Lấy id từ URL

  return (
    <Tabs tabPosition='left'>
      <TabPane tab='Đặt sân theo ngày' key='1'>
        <BookingByDate id={id} />
      </TabPane>
      <TabPane tab='Đặt sân lịch cố định' key='2'>
        <BookingFixedByMonth id={id} />
      </TabPane>
    </Tabs>
  );
}
