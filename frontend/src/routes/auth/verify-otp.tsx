import { createFileRoute } from "@tanstack/react-router";
import VerifyOtp from "../../modules/auth/pages/auth/OtpVerificationPage";

export const Route = createFileRoute("/auth/verify-otp")({
  component: VerifyOtp,
});
