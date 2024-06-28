import { Col, Row } from "antd";
import CarouselOverview from "./components/CarouselOverview";
import HistoryTournament from "./components/HistoryTournament";
import ButtonRouter from "./components/ButtonRouter";
import TopCenter from "./components/TopCenter";

export default function Tournament() {
  return (
    <div style={{ marginBottom: "30px" }}>
      <CarouselOverview />
      <div style={{ marginTop: "30px" }}>
        <HistoryTournament />
      </div>
      <Row gutter={16} justify="center">
        <Col span={12}>
          <ButtonRouter />
        </Col>
      </Row>
      <Row style={{ marginTop: "30px" }}>
        <TopCenter />
      </Row>
    </div>
  );
}
