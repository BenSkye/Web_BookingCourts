import { useEffect, useState } from "react";
import { getAllCenterAPI } from "@/services/centersAPI/getCenters";
import ListCenter from "./ListCenter";
export default function ChooseCenter() {
  const [center, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCenters = async () => {
      try {
        setLoading(true);
        let data = await getAllCenterAPI();
        data = data.map((center) => ({
          ...center,
          pricePerHour: center.price.find(
            (price) => price.scheduleType === "NP"
          )?.price,
        }));
        // Filter centers with status 'active'
        console.log("datas", data);

        data = data.filter((center) => center.status === "active");
        setCenters(data);
        console.log("datas", data);
      } catch (error) {
        console.error("Failed to fetch centers:", error);
      } finally {
        setLoading(false);
      }
    };
    getCenters();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Danh sách trung tâm cầu lông</h1>
      <ListCenter listCenter={center} loading={loading} />
    </div>
  );
}
