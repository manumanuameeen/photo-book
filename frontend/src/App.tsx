import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "./modules/auth/pages/Signup";
import LoginPage from "./modules/auth/pages/LoginPage";
import OtpVerificationPage from "./modules/auth/pages/OtpVerificationPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<OtpVerificationPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

