import React, { useState, useEffect } from "react";
import {
  Input,
  Upload,
  Button,
  Steps,
  message,
  Form,
  InputNumber,
  TimePicker,
  Checkbox,
  Progress,
  Row,
  Col,
  Card,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import { submitForm } from "../../../services/partnerAPI";
import { useNavigate } from "react-router-dom";
import ServicesAndAmenities from "./components/ServicesAndAmenities";
import CenterDetailsForm from "./components/CenterDetailsForm";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../../../utils/firebase/firebase";
import ReviewStep from "./components/ReviewStep";
import PriceAndTime from "./components/PriceAndTime";
import {
  FaCar,
  FaHome,
  FaWifi,
  FaStore,
  FaRestroom,
  FaCoffee,
  FaTools,
  FaUser,
  FaFirstAid,
  FaShower,
  FaLock,
} from "react-icons/fa";

const { Step } = Steps;

const storage = getStorage(app);

const CenterForm = () => {
  const [fileListCourt, setFileListCourt] = useState([]);
  const [fileListLicense, setFileListLicense] = useState([]);
  const [showGoldenPrice, setShowGoldenPrice] = useState(false);
  const [showByMonthPrice, setShowByMonthPrice] = useState(false);
  const [showBuyPackage, setShowBuyPackage] = useState(false);
  const [uploadProgressCourt, setUploadProgressCourt] = useState(0);
  const [uploadProgressLicense, setUploadProgressLicense] = useState(0);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  const handleUploadCourt = async ({ file, onSuccess, onError }) => {
    try {
      const storageRef = ref(storage, `images/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgressCourt(progress); // Update progress
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          onError(error);
          message.error("Đăng tải ảnh không thành công, hãy kiểm tra lại tệp");
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("File available at", downloadURL);
            onSuccess(null, file);
            setFileListCourt((prevList) => [
              ...prevList,
              { ...file, url: downloadURL },
            ]);
            setUploadProgressCourt(0); // Reset progress
            message.success("Tải ảnh lên thành công");
          });
        }
      );
    } catch (error) {
      onError(error);
      message.error("Upload failed");
    }
  };

  const handleUploadLicense = async ({ file, onSuccess, onError }) => {
    try {
      const storageRef = ref(storage, `images/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgressLicense(progress); // Update progress
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          onError(error);
          message.error("Upload failed");
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("File available at", downloadURL);
            onSuccess(null, file);
            setFileListLicense((prevList) => [
              ...prevList,
              { ...file, url: downloadURL },
            ]);
            setUploadProgressLicense(0); // Reset progress
            message.success("Upload successful");
          });
        }
      );
    } catch (error) {
      onError(error);
      message.error("Upload failed");
    }
  };

  const handleCheckboxChange = (e) => {
    setShowGoldenPrice(e.target.checked);
  };

  const handleByMonthPriceChange = (e) => {
    setShowByMonthPrice(e.target.checked);
  };

  const handleBuyPackageChange = (e) => {
    setShowBuyPackage(e.target.checked);
  };

  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [formValues, setFormValues] = useState({
    center: {
      centerName: "",
      location: "",
      openTime: "",
      closeTime: "",
      courtCount: 0,
      images: [],
      imagesLicense: [],
      services: [],
      rule: "",
    },
    price: [
      {
        price: 0,
        startTime: "",
        endTime: "",
        scheduleType: "",
      },
    ],
  });
  const navigate = useNavigate();
  useEffect(() => {
    const token = Cookies.get("jwtToken");
    if (!token) {
      message.error("Token not found. Please log in.");
    }
  }, []);

  const steps = [
    {
      title: "Thông tin chi tiết của trung tâm",
      content: (
        <CenterDetailsForm
          form={form}
          handleUploadCourt={handleUploadCourt}
          handleUploadLicense={handleUploadLicense}
          fileListCourt={fileListCourt}
          fileListLicense={fileListLicense}
          setFileListCourt={setFileListCourt}
          setFileListLicense={setFileListLicense}
          uploadProgressCourt={uploadProgressCourt}
          uploadProgressLicense={uploadProgressLicense}
        />
      ),
    },
    {
      title: "Thông tin chi tiết về giá tiền và giờ chơi",
      content: (
        <PriceAndTime
          form={form}
          handleCheckboxChange={handleCheckboxChange}
          showGoldenPrice={showGoldenPrice}
          handleByMonthPriceChange={handleByMonthPriceChange}
          showByMonthPrice={showByMonthPrice}
          handleBuyPackageChange={handleBuyPackageChange}
          showBuyPackage={showBuyPackage}
        />
      ),
    },
    {
      title: "Xem lại và xác nhận thông tin",
      content: <ReviewStep formValues={formValues} />,
    },
  ];

  const next = () => {
    form
      .validateFields()
      .then((values) => {
        const newFormValues = { ...formValues };
        if (current === 0) {
          newFormValues.center = {
            centerName: values.centerName,
            location: values.location,
            openTime: values.openTime.format("HH:mm"),
            closeTime: values.closeTime.format("HH:mm"),
            courtCount: values.courtCount,
            images: fileListCourt.map((file) => file.url),
            imagesLicense: fileListLicense.map((file) => file.url),
            services: values.services,
            rule: values.rule,
          };
        } else if (current === 1) {
          const openTime = newFormValues.center.openTime;
          const closeTime = newFormValues.center.closeTime;
          newFormValues.price = [
            {
              price: values.normalPrice,
              startTime: openTime,
              endTime: closeTime,
              scheduleType: "NP",
            },
          ];

          if (showGoldenPrice) {
            newFormValues.price.push({
              price: values.goldenPrice,
              startTime: values.startTimeGolden.format("HH:mm"),
              endTime: values.endTimeGolden.format("HH:mm"),
              scheduleType: "GP",
            });
          }

          if (showByMonthPrice) {
            newFormValues.price.push({
              price: values.byMonthPrice,
              startTime: openTime,
              endTime: closeTime,
              scheduleType: "MP",
            });
          }

          if (showBuyPackage) {
            newFormValues.price.push({
              price: values.buyPackagePrice,
              startTime: openTime,
              endTime: closeTime,
              scheduleType: "PP",
            });
          }
        }
        setFormValues(newFormValues);
        setCurrent(current + 1);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitDisabled(true); // Disable the submit button
    try {
      const token = Cookies.get("jwtToken");
      await submitForm(formValues, token);
      message.success("Form submitted successfully!");
      navigate("/courtManage");
    } catch (error) {
      console.log(error);
      message.error("Failed to submit form!");
      setIsSubmitDisabled(false); // Re-enable the button if submission fails
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Steps current={current} style={{ marginBottom: "20px" }}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div style={{ minHeight: "400px" }} className="steps-content">
        {steps[current].content}
      </div>
      <div className="steps-action" style={{ textAlign: "right" }}>
        {current > 0 && (
          <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
            Trở về
          </Button>
        )}
        {current < steps.length - 1 && (
          <Button type="primary" onClick={() => next()}>
            Tiếp theo
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button
            type="primary"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
          >
            Xác nhận thông tin và tạo sân
          </Button>
        )}
      </div>
    </div>
  );
};

export default CenterForm;
