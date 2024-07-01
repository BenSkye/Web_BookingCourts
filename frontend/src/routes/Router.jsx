import { Routes, Route, Navigate } from "react-router-dom";
import LayoutMain from "@/components/layouts";
import Home from "@/pages/home";
import AboutUs from "@/components/dashboard/aboutUs";
import Partner from "@/pages/courtManage/partner";
import Tournament from "@/pages/tournament";
import Login from "@/pages/login/login";
import SignUp from "@/pages/login/signup";
import Detail from "@/pages/detail/detail";
import BookingDetail from "@/components/booking/bookingDetails";
import ProfileAccount from "../pages/account/profileAccount/index";

import RegisterPackageCourt from "@/pages/courtManage/registerPackageCourt";
import TournamentCreate from "@/pages/tournamentCreate";
import RegistTournamentForm from "@/pages/tournamentCreate/components/RegistTournamentForm";
import CourtManage from "@/pages/courtManage";
import CourtManageDetail from "../pages/courtManage/courtManageDetail";
import PaymentBookingFixed from "../components/booking/bookingDetails/bookingFixedByMonth/components/payment/paymentBookingFixed";
import ManagerDashboar from "@/pages/courtManage/ManagerDashboard";
import ManagerCalendar from "../pages/courtManage/ManagerCalendar";
import SignupPartner from "../pages/login/signupPartner";
import BookingCourtDirectly from "../pages/BookingCourtDirectly/BookingCourtDirectly";
import RequestToOrganizeATournament from "../pages/RequestToOrganizeATournament/RequestToOrganizeATournament";
import NoAccess from "../components/noAccess/noAccess";
import NotFound404 from "../components/noAccess/notFound404";

import ProtectedRoute from "../utils/authRoute/authRoute";
import CourtManageUpdate from "../pages/courtManage/courtManageUpdate";

import ManageCenter from "../pages/courtManage/manageCourtByAdmin/manageCenter";
import AdminDashboard from "../pages/courtManage/manageCourtByAdmin/adminManage";
import UserManagement from "../pages/courtManage/manageCourtByAdmin/managePeople";
import ManagerManagement from "../pages/courtManage/manageCourtByAdmin/manageManager";
import PersonalTournament from "../pages/tournament/components/PersonalTournament";
import TournamentDetail from "../pages/TournamentDetail";
function Routing() {
  return (
    <Routes>
      <Route path="/" element={<LayoutMain />}>
        <Route
          index
          element={
            <ProtectedRoute roles={["guest"]}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/aboutUs"
          element={
            <ProtectedRoute roles={["guest"]}>
              <AboutUs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/detail/:id"
          element={
            <ProtectedRoute roles={["guest"]}>
              <Detail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournament"
          element={
            <ProtectedRoute roles={["guest"]}>
              <Tournament />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournament/create"
          element={
            <ProtectedRoute roles={["guest"]}>
              <TournamentCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournament/personal"
          element={
            <ProtectedRoute roles={["guest"]}>
              <PersonalTournament />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournament/create/:centerID"
          element={
            <ProtectedRoute roles={["guest"]}>
              <RegistTournamentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournament/detail/:tournamentID"
          element={<TournamentDetail />}
        />
        <Route
          path="/bookingdetail/:id"
          element={
            <ProtectedRoute roles={["guest"]}>
              <BookingDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute roles={["customer", "manager", "admin"]}>
              <ProfileAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/my-account"
          element={
            <ProtectedRoute roles={["customer", "manager", "admin"]}>
              <ProfileAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/update-password"
          element={
            <ProtectedRoute roles={["customer", "manager", "admin"]}>
              <ProfileAccount />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/bill"
          element={
            <ProtectedRoute roles={["customer", "manager"]}>
              <ProfileAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/booking-court"
          element={
            <ProtectedRoute roles={["customer"]}>
              <ProfileAccount />
            </ProtectedRoute>
          }
        />
        <Route path="/paymentBookingFixed" element={<PaymentBookingFixed />} />
        <Route
          path="/courtManage/registerPackageCourt/:id"
          element={
            <ProtectedRoute roles={["manager"]}>
              <RegisterPackageCourt />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courtManage"
          element={
            <ProtectedRoute roles={["manager"]}>
              <CourtManage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courtManage/detail/:id"
          element={
            <ProtectedRoute roles={["manager"]}>
              <CourtManageDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courtManage/update/:id"
          element={
            <ProtectedRoute roles={["manager"]}>
              <CourtManageUpdate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courtManage/Dashboard"
          element={
            <ProtectedRoute roles={["manager"]}>
              <ManagerDashboar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courtManage/BookingCourtDirectly"
          element={
            <ProtectedRoute roles={["manager"]}>
              <BookingCourtDirectly />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courtManage/RequestToOrganizeATournament"
          element={
            <ProtectedRoute roles={["manager"]}>
              <RequestToOrganizeATournament />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courtManage/ManagerCalendar"
          element={
            <ProtectedRoute roles={["manager"]}>
              <ManagerCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courtManage/partner"
          element={
            <ProtectedRoute roles={["manager"]}>
              <Partner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manageCenter"
          element={
            <ProtectedRoute roles={["admin"]}>
              <ManageCenter />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/Dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/UserManagement"
          element={
            <ProtectedRoute roles={["admin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ManagerManagement"
          element={
            <ProtectedRoute roles={["admin"]}>
              <ManagerManagement />
            </ProtectedRoute>
          }
        />
        <Route path="/courtManage/partner" element={<Partner />} />
        <Route path="*" element={<Navigate to="/not-found" />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signupPartner" element={<SignupPartner />} />
      <Route path="/no-access" element={<NoAccess />} />
      <Route path="/not-found" element={<NotFound404 />} />
    </Routes>
  );
}

export default Routing;
