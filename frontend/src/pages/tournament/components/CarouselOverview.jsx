import { Carousel } from "antd";

// Define an array of background images for each slide
const backgroundImageUrls = [
  "url('https://storage.googleapis.com/leep_app_website/2020/09/day-vot-cau-long-image.jpg')",
  "url('https://storage.googleapis.com/leep_app_website/2020/09/day-vot-cau-long-image.jpg')",
  "url('https://storage.googleapis.com/leep_app_website/2020/09/day-vot-cau-long-image.jpg')",
  "url('https://storage.googleapis.com/leep_app_website/2020/09/day-vot-cau-long-image.jpg')",
];

// Function to generate content style with dynamic background image
const getContentStyle = (index) => ({
  position: "relative",
  margin: 0,
  height: "250px",
  color: "#fff",
  lineHeight: "160px",
  textAlign: "center",
  backgroundImage: backgroundImageUrls[index],
  backgroundSize: "cover",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const textStyle = {
  zIndex: 1,
  position: "relative",
};

export default function CarouselOverview() {
  return (
    <div>
      <Carousel arrows infinite={false}>
        <div>
          <h1 style={{ ...getContentStyle(0), ...textStyle }}>
            Đăng ký thuê sân để tổ chức giải đấu.
          </h1>
        </div>
        <div>
          <h1 style={{ ...getContentStyle(1), ...textStyle }}>
            Dành cho mọi giải đấu từ phong trào đến chuyên nghiệp
          </h1>
        </div>
        <div>
          <h1 style={{ ...getContentStyle(2), ...textStyle }}>
            Đăng ký minh bạch rõ ràng
          </h1>
        </div>
        <div>
          <h1 style={{ ...getContentStyle(3), ...textStyle }}>
            Thanh toán nhanh
          </h1>
        </div>
      </Carousel>
    </div>
  );
}
