import { useState } from 'react';
import { Steps } from 'antd';
import { MdPayment } from 'react-icons/md';
import { IoCheckmarkDoneCircleOutline } from 'react-icons/io5';
import { CiBoxList } from 'react-icons/ci';
import PickTimeBooking from '@/components/booking/bookingDetails/bookingByDate/components/pickSlotsBooking';
import PaymentBooking from '@/components/booking/bookingDetails/bookingByDate/components/paymentBooking';
import ViewBooking from '@/components/booking/bookingDetails/bookingByDate/components/viewBooking';
import PlayHourDetails from './components/bookingByHour'

const { Step } = Steps;

export default function BookingByDate({ id }) {
  // Lấy id từ URL

  // State để lưu trạng thái của bước hiện tại
  const [currentStep, setCurrentStep] = useState(0);

  // Mảng chứa các bước
  const steps = [
    {
      title: 'Chi tiết đặt sân',
      icon: <CiBoxList />,
      content: (
        <PickTimeBooking checkOut={() => setCurrentStep(1)} idCenter={id} />
      ),
    },
    {
      title: 'Thanh toán',
      icon: <MdPayment />,
      content: <PaymentBooking setCurrentStep={setCurrentStep} />,
    },
    {
      title: 'Hoàn thành',
      icon: <IoCheckmarkDoneCircleOutline />,
      content: <ViewBooking setCurrentStep={setCurrentStep} />,
    },

  ];

  return (
    <div>
      <Steps
        current={currentStep}
        style={{ width: '100%', margin: 'auto', fontWeight: 'bold' }}
      >
        {steps.map((item) => (
          <Step key={item.title} title={item.title} icon={item.icon} />
        ))}
      </Steps>
      <div style={{ width: '100%' }}>{steps[currentStep].content}</div>
    </div>
  );
}
