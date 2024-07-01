import { Avatar, Button, Card, Carousel } from "antd";
import Meta from "antd/es/card/Meta";
import { Link } from "react-router-dom";
import NoImg from "@/assets/noImg.jpg";
export default function CenterCard({ center }) {
  const handleImageError = (e) => {
    e.target.src = NoImg;
  };
  return (
    <Card
      hoverable
      style={{ width: "100%", border: "0.1px solid #e0e0e0" }}
      cover={
        <Carousel
          autoplay
          style={{
            background: "#e1e8e3",
            width: "100%",
            height: "100%",
          }}
        >
          {center.images.map((img, index) => (
            <div
              key={index}
              style={{
                height: "100%",
                width: "100%",
                overflow: "hidden",
              }}
            >
              <img
                alt={center.centerName}
                src={img}
                onError={handleImageError}
                style={{
                  width: "100%",
                  height: "250px",
                  objectFit: "cover",
                }}
              />
            </div>
          ))}
        </Carousel>
      }
    >
      <Meta
        avatar={
          <Avatar src="https://sieuthicaulong.vn/images/badminton-yard/1693408873_gallery_2022-04-07.jpg" />
        }
        title={center.centerName}
        description={center.location}
      />
      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <Link to={`/tournament/create/${center._id}`}>
          <Button
            style={{
              height: "100%",
              width: "100%",
              fontSize: "18px",
              backgroundColor: "#1890ff",
              color: "white",
            }}
            type="primary"
          >
            Đăng ký tổ chức giải đấu tại sân
          </Button>
        </Link>
      </div>
    </Card>
  );
}
