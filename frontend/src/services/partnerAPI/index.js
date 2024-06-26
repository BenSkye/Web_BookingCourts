import axios from "axios";
import { useParams } from "react-router-dom";
import { fetchData } from "../fetchAPI";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const submitForm = async (formValues, token) => {
  try {
    const response = await fetch(`${apiBaseUrl}/center`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formValues),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Network response was not ok");
    }

    return response.json();
  } catch (error) {
    console.error("Error submitting form:", error);
    throw error;
  }
};

export const getFormDataAPI = async (token) => {
  try {
    const response = await fetch(
      `${apiBaseUrl}/center/my-centers`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export async function getCenterByIdAPI(centerId, token) {
  try {
    const response = await fetch(
      `${apiBaseUrl}/center/my-centers/${centerId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Call Error: ", error);
    return {};
  }
}

export async function getPersonalActiveCenter() {
  try {
    const response = await fetchData(
      `${apiBaseUrl}/center/my-active-centers`
    );
    console.log("Response:", response);
    if (response.status === "success") {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

//lấy ra cho chủ sân những status đã xác nhận, hoàn thành, hết hạn
export async function getBookingByCenterIdAndDay(centerId, date) {
  try {
    const response = await fetchData(
      `${apiBaseUrl}/booking/get-booking-by-day-and-center?centerId=${centerId}&date=${date}`
    );
    console.log("Response:", response);
    if (response.status === "success") {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}
