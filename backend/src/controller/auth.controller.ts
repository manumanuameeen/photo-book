import express from "express";

import { AuthService } from "../services/auth/auth.servise.ts";
import type { IAuthController } from "../interfaces/IauthController.ts";

export class AuthController implements IAuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async signup(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { name, email, password, phone } = req.body;
      const result = await this.authService.signup({ name, email, password, phone });
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.user,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async verifyOtp(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      const { accessToken, refreshToken, user } = await this.authService.verifyOtp(email, otp);
      this.setCookies(res, accessToken, refreshToken);
      res.json({
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async resendOtp(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { email } = req.body;
      const result = await this.authService.resendOtp(email);
      res.json({ success: true, message: result.message });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async login(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await this.authService.login(email, password);
      this.setCookies(res, accessToken, refreshToken);
      res.json({
        success: true,
        message: "Login successful",
        user: { _id: user._id, name: user.name, email: user.email },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async refresh(req: express.Request, res: express.Response): Promise<void> {
    try {
      const old = req.cookies.refreshToken;
      if (!old) throw new Error("Missing refresh token");
      const { accessToken, refreshToken } = await this.authService.refresh(old);
      this.setCookies(res, accessToken, refreshToken);
      res.json({ success: true, accessToken, refreshToken });
    } catch (error: any) {
      res.status(402).json({ success: false, message: error.message });
    }
  }

  async logout(req: express.Request, res: express.Response): Promise<void> {
    const token = req.cookies.refreshToken;
    if (token) await this.authService.logout(token);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ success: true, message: "Logged out" });
  }

  private setCookies(res: express.Response, access: string, refresh: string) {
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("accessToken", access, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
