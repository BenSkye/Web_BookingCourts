import { Col, Row } from "antd";
import CarouselOverview from "./components/CarouselOverview";
import HistoryTournament from "./components/HistoryTournament";
import ButtonRouter from "./components/ButtonRouter";
import TopCenter from "./components/TopCenter";
export default function tournament() {
  return (
    <div>
      <CarouselOverview />
      <Row gutter={16}>
        <Col span={12}>
          <HistoryTournament />
        </Col>
        <Col
          span={12}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ButtonRouter />
        </Col>
      </Row>
      {/* <Row style={{ marginTop: 30 }}>
        <TopCenter />
      </Row> */}
    </div>
  );
}
