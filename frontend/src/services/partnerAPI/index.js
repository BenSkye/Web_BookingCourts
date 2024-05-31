import axios from "axios";
import { useParams } from "react-router-dom";

// Hàm này sẽ gửi dữ liệu từ form đến API
export async function submitForm(data) {
  try {
    const response = await axios.post(
      "https://65b61de2da3a3c16ab003ad9.mockapi.io/courtManager",
      data
    );
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

export async function getFormDataAPI() {
  try {
    const response = await axios.get(
      "https://65b61de2da3a3c16ab003ad9.mockapi.io/courtManager"
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getFormDataByIdAPI(id) {
 
  try {
    const response = await axios.get(
      `https://65b61de2da3a3c16ab003ad9.mockapi.io/courtManager/${id}`
    );
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("API Call Error: ", error);
    return {};
  }
}
