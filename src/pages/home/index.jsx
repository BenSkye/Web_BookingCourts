import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Col, Row, Avatar, Button } from 'antd';
import SearchBar from '@/pages/home/components/searchBar';
import { getAllCourtsAPI } from '@/services/courtAPI/getCourtsAPI';
import NoImg from '@/assets/noImg.jpg';

const { Meta } = Card;

export default function Home() {
  const [courts, setCourts] = useState([]);

  useEffect(() => {
    const getCourts = async () => {
      const data = await getAllCourtsAPI();
      setCourts(data);
    };
    getCourts();
  }, []);

  const handleImageError = (e) => {
    e.target.src = NoImg;
  };

  return (
    <Row
      gutter={[16, 16]}
      style={{
        margin: '0 auto',
      }}
    >
      <Col span={24}>
        <SearchBar />
      </Col>

      {courts.map((court) => (
        <Col key={court.id} xs={24} sm={12} lg={8}>
          <Card
            hoverable
            style={{
              width: '100%',
            }}
            cover={
              <div style={{ height: '200px', overflow: 'hidden' }}>
                <img
                  alt={court.nameCourt}
                  src={court.imgCourt}
                  onError={handleImageError}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            }
          >
            <Meta
              avatar={<Avatar src={court.avatarUrl} />}
              title={court.nameCourt}
              description={court.locationCourt}
            />
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              {/* Pass the court ID to the detail page */}
              <Link to={`/detail/${court.id}`}>
                <Button style={{ height: '40px', width: '150px', fontSize: '18px' }}>
                  Xem chi tiết
                </Button>
              </Link>
              <Link to={`/bookingdetail/${court.id}`}>
                <Button
                  style={{ height: '50px', width: '150px', fontSize: '18px' }}
                  type='primary'
                >
                  Đặt sân ngay
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}