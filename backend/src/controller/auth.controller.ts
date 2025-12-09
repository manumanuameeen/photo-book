import type { Request, Response } from "express";
import { z } from "zod";
import type { IAuthController } from "../interfaces/user/IauthController.ts";
import type { IAuthService } from "../services/user/auth/IAuthService.ts";
import {
  ForgetPasswordDto,
  LoginDto,
  ResendOtpDto,
  ResetPasswordDto,
  SignupDto,
  VerifyOtpDto,
  VerifyResetOtpDto,
} from "../dto/auth.dto.ts";
import { ApiResponse } from "../utils/response.ts";
import { HttpStatus } from "../constants/httpStatus.ts";
import { Messages } from "../constants/messages.ts";
import { ENV } from "../constants/env.ts";
import { AppError } from "../utils/AppError.ts";
import { UserMapper } from "../mappers/user.mapper.ts";

export class AuthController implements IAuthController {
  private readonly _authService: IAuthService;

  constructor(authService: IAuthService) {
    this._authService = authService;
  }

  private _validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
  }

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const input = this._validate(SignupDto, req.body);
      const result = await this._authService.signup(input);
      ApiResponse.success(
        res,
        { user: { email: input.email, name: input.name } },
        result.message,
        HttpStatus.CREATED,
      );
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const input = this._validate(VerifyOtpDto, req.body);
      const result = await this._authService.verifyOtp(input);
      this._setCookies(res, result.accessToken, result.refreshToken);
      ApiResponse.success(
        res,
        {
          user: UserMapper.toAuthResponse(result.user),
        },
        Messages.OTP_VERIFIED,
      );
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  resendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const input = this._validate(ResendOtpDto, req.body);
      const result = await this._authService.resendOtp(input);
      ApiResponse.success(res, null, result.message);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("login controller", req.body);
      const input = this._validate(LoginDto, req.body);
      const result = await this._authService.login(input);
      this._setCookies(res, result.accessToken, result.refreshToken);
      ApiResponse.success(res,{user: UserMapper.toAuthResponse(result.user),},Messages.LOGIN_SUCCESS,);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;

      console.log("🔄 Refresh token request received");
      console.log("📝 Cookies:", req.cookies);

      if (!refreshToken) {
        console.log("❌ No refresh token found in cookies");
        throw new AppError(Messages.REFRESH_TOKEN_MISSING, HttpStatus.UNAUTHORIZED);
      }

      console.log("✅ Refresh token found, attempting refresh...");
      const result = await this._authService.refresh(refreshToken);

      console.log("✅ Refresh successful, setting new cookies");
      this._setCookies(res, result.accessToken, result.refreshToken);

      ApiResponse.success(res, { user: UserMapper.toAuthResponse(result.user) });
    } catch (error: unknown) {
      console.error("❌ Refresh error:", error);

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      this._handleError(res, error);
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) await this._authService.logout(refreshToken);
      res.clearCookie("accessToken").clearCookie("refreshToken");
      ApiResponse.success(res, null, Messages.LOGOUT_SUCCESS);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  forgetpassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const input = this._validate(ForgetPasswordDto, req.body);
      const result = await this._authService.forgetPassword(input);
      ApiResponse.success(res, null, result.message);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  verifyResetOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("reached");
      const input = this._validate(VerifyResetOtpDto, req.body);
      const result = await this._authService.verifyResetOtp(input);
      ApiResponse.success(res, null, result.message);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const input = this._validate(ResetPasswordDto, req.body);
      const result = await this._authService.resetPassword(input);
      ApiResponse.success(res, null, result.message);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  private _handleError(res: Response, error: unknown): void {
    if (error instanceof z.ZodError) {
      ApiResponse.error(res, "Validation failed", HttpStatus.BAD_REQUEST);
      return;
    }

    if (error instanceof AppError) {
      ApiResponse.error(res, error.message, error.statusCode as HttpStatus);
      return;
    }

    if (error instanceof Error) {
      const status = error.message.includes("blocked")
        ? HttpStatus.FORBIDDEN
        : error.message.includes("exists")
          ? HttpStatus.CONFLICT
          : HttpStatus.BAD_REQUEST;
      ApiResponse.error(res, error.message, status);
      return;
    }

    ApiResponse.error(res, Messages.INTERNAL_ERROR);
  }

  private _setCookies(res: Response, access: string, refresh: string): void {
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", access, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: ENV.ACCESS_TOKEN_MAX_AGE,
    });

    res.cookie("refreshToken", refresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: ENV.REFRESH_TOKEN_MAX_AGE,
    });

    console.log("cookies set successfully");
  }
}
