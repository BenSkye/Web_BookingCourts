import { Button, Modal, Pagination, Skeleton, Table } from "antd";
import { useEffect, useState } from "react";
import { getAllTournamentAPI } from "../../../services/tournamentAPI/tournamentAPI";
import TournamentDetail from "../../TournamentDetail";

const pageSize = 3;

export default function HistoryTournament() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tournamentId, setTournamentId] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [ListTournament, setListTournament] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      try {
        const data = await getAllTournamentAPI();
        console.log("top 4", data);
        setListTournament(data);
      } catch (error) {
        console.error("Failed to fetch tournaments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const showModal = (tournamentId) => {
    setTournamentId(tournamentId);
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleChange = (page) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      title: "Tên giải đấu",
      dataIndex: "tournamentName",
      key: "tournamentName",
      render: (text, record) => (
        <Button type="link" onClick={() => showModal(record.id)}>
          {text}
        </Button>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "timeRange",
      key: "timeRange",
      render: (text, record) => (
        <span>{`${record.startDate} - ${record.endDate}`}</span>
      ),
    },
  ];

  return (
    <div>
      <h1>Các giải đấu đã được tổ chức</h1>
      {loading ? (
        <Skeleton active />
      ) : (
        <Table
          dataSource={ListTournament.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
          )}
          columns={columns}
          pagination={false}
          rowKey="id"
          style={{ marginBottom: "20px" }}
        />
      )}
      <Pagination
        current={currentPage}
        onChange={handleChange}
        pageSize={pageSize}
        total={ListTournament.length}
        style={{ display: "flex", justifyContent: "center", marginTop: "5px" }}
      />
      <Modal
        title="Chi tiết giải đấu"
        visible={isModalOpen}
        footer={null}
        onCancel={handleOk}
      >
        <TournamentDetail tournamentId={tournamentId} />
      </Modal>
    </div>
  );
}
