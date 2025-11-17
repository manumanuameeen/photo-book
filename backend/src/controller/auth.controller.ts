import type { Request, Response } from "express";
import { z } from "zod";
import type { IAuthController } from "../interfaces/user/IauthController.ts";
import type { IAuthService } from "../services/user/auth/IAuthService.ts";
import type { UnknownError } from "../../types";
import { ForgetPasswordDto, LoginDto, ResendOtpDto, ResetPasswordDto, SignupDto, VerifyOtpDto, VerifyResetOtpDto } from "../dto/auth.dto.ts";
import { ApiResponse } from "../utils/response.ts";
import { HttpStatus } from "../constants/httpStatus.ts";
import { Messages } from "../constants/messages.ts";
import { ENV } from "../constants/env.ts";

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
      ApiResponse.success(res, null, result.message, HttpStatus.CREATED);
    } catch (error: UnknownError) {
      this._handleError(res, error);
    }
  }

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const input = this._validate(VerifyOtpDto, req.body);
      const result = await this._authService.verifyOtp(input);
      this._setCookies(res, result.accessToken, result.refreshToken);
      ApiResponse.success(res, {
        user: {
          id: result.user._id,
          name: result.user.name,
          email: result.user.email,
        },
      }, Messages.OTP_VERIFIED);
    } catch (error: UnknownError) {
      this._handleError(res, error);
    }
  }

  resendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const input = this._validate(ResendOtpDto, req.body);
      const result = await this._authService.resendOtp(input);
      ApiResponse.success(res, null, result.message);
    } catch (error: UnknownError) {
      this._handleError(res, error);
    }
  }

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const input = this._validate(LoginDto, req.body);
      const result = await this._authService.login(input);
      this._setCookies(res, result.accessToken, result.refreshToken);
      ApiResponse.success(res, {
        user: {
          id: result.user._id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
      }, Messages.LOGIN_SUCCESS);
    } catch (error: UnknownError) {
      this._handleError(res, error);
    }
  }

  refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {

        throw new Error(Messages.REFRESH_TOKEN_MISSING)
      };
      const result = await this._authService.refresh(refreshToken);
      this._setCookies(res, result.accessToken, result.refreshToken);
      ApiResponse.success(res, { user: result.user });
    } catch (error: UnknownError) {
      this._handleError(res, error);
    }
  }

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) await this._authService.logout(refreshToken);
      res.clearCookie("accessToken").clearCookie("refreshToken");
      ApiResponse.success(res, null, Messages.LOGOUT_SUCCESS);
    } catch (error: UnknownError) {
      this._handleError(res, error);
    }

  }

  forgetpassword = async (req: Request, res: Response): Promise<void> => {
    try {
      // console.log(req)
      const input = this._validate(ForgetPasswordDto, req.body);
      const result = await this._authService.forgetPassword(input);
      ApiResponse.success(res, null, result.message)

    } catch (error: UnknownError) {
      this._handleError(res, error);
    }
  }

  verifyResetOtp = async (req: Request, res: Response): Promise<void> => {
    try {

      const input = this._validate(VerifyResetOtpDto, req.body);
      const result = await this._authService.verifyResetOtp(input)
      ApiResponse.success(res, null, result.message)

    } catch (error: UnknownError) {
      this._handleError(res, error)
    }
  }

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const input = this._validate(ResetPasswordDto, req.body);
      const result = await this._authService.resetPassword(input);
      ApiResponse.success(res, null, result.message)
    } catch (error: UnknownError) {
      this._handleError(res, error);
    }
  }

  private _handleError(res: Response, error: UnknownError) {
    if (error instanceof z.ZodError) {
      return ApiResponse.error(res, "Validation failed", HttpStatus.BAD_REQUEST);
    }
    if (error instanceof Error) {
      const status = error.message.includes("blocked")
        ? HttpStatus.FORBIDDEN
        : error.message.includes("exists")
          ? HttpStatus.CONFLICT
          : HttpStatus.BAD_REQUEST;
      return ApiResponse.error(res, error.message, status);
    }
    return ApiResponse.error(res, Messages.INTERNAL_ERROR);
  }

  private _setCookies(res: Response, access: string, refresh: string) {
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
  }
}