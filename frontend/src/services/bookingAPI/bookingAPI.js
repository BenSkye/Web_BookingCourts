import { fetchData, postData, putData } from "../fetchAPI";
import Cookies from "js-cookie";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${apiBaseUrl}/playPackage`;

export const getBookingByInvoiceIdAPI = async (invoiceId) => {
  const response = await fetchData(
    `${apiBaseUrl}/booking/get-booking-by-invoiceId/${invoiceId}`
  );
  console.log("Response:", response);
  if (response.data.status === "fail") {
    return response.data;
  }
  if (response.status === "success") {
    return response.data;
  }
};

export const checkBookingAvailablebyDayAPI = async (data) => {
  const response = await postData(
    `${apiBaseUrl}/booking/create-booking-byday`,
    data
  );
  console.log("Response:", response);
  if (response.data.status === "fail") {
    return response.data;
  }
  if (response.status === 201) {
    return response.data;
  }
};
export const UpdateBookingIncreasePrice = async (data) => {
  const response = await putData(
    `${apiBaseUrl}/booking/update-booking-byDay-increase-price`,
    data
  );
  console.log("Response:", response);
  if (response.data.status === "fail") {
    return response.data;
  }
  if (response.status === 201) {
    return response.data;
  }
};

export const UpdateBookingDecreasePrice = async (data) => {
  const response = await putData(
    `${apiBaseUrl}/booking/update-booking-byDay-decrease-price`,
    data
  );
  console.log("Response:", response);
  if (response.data.status === "fail") {
    return response.data;
  }
  if (response.status === 201) {
    return response.data;
  }
};

export const getPersonalBookingAPI = async () => {
  const response = await fetchData(
    `${apiBaseUrl}/booking/get-personal-booking`
  );
  console.log("Response:", response);
  if (response.data.status === "fail") {
    return response.data;
  }
  if (response.status === "success") {
    return response.data;
  }
};

export const addPlayPackage = async (playPackageData) => {
  try {
    const response = await postData(
      `${apiBaseUrl}/playPackage`,
      playPackageData
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const completeBookingAPI = async (bookingId) => {
  const response = await fetchData(
    `${apiBaseUrl}/booking/completed-booking/${bookingId}`
  );
  console.log("Response:", response);
  if (response.status === "fail") {
    return response.data;
  }
  if (response.status === "success") {
    return response.data;
  }
};

export const cancelBookingAPI = async (bookingId) => {
  const response = await fetchData(
    `${apiBaseUrl}/booking/cancelled-booking/${bookingId}`
  );
  console.log("Response:", response);
  if (response.status === "fail") {
    return response;
  }
  if (response.status === "success") {
    return response;
  }
};
