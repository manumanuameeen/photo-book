// import { Request, Response } from "express"
// import { AuthService } from "../../services/auth.servise.ts"
// import { IAuthController } from "../interface/IauthController.ts";


// export class AuthController implements IAuthController{

//     private authService: AuthService;

//     constructor(authServise:AuthService) {
//         this.authService = authServise
//     }

//     async signup(req: Request, res: Response): Promise<void> {
//         try {
//             const { name, email, password, phone } = req.body;
//             const result = await this.authService.signup({ name, email, password, phone })
//             res.status(201).json({ sucess: true, message: "User registered succefully . otp sent to email", data: result });
//         } catch (error: any) {
//             res.status(400).json({ message: error.message })
//         }
//     }

//     async verifyOtp(req: Request, res: Response): Promise<void> {
//         try {
//             const { email, otp } = req.body
//             const { accessToken, refreshToken, user } = await this.authService.verifyOtp(email, otp)
//             this.setCookies(res, accessToken, refreshToken)
//             res.json({
//                 sucess: true,
//                 message: "login successfull",
//                 user: {
//                     id: user._id,
//                     name: user.name,
//                     email: user.email
//                 },
//             })
//         } catch (error: any) {
//             res.status(400).json({ success: false, message: error.message })
//         }
//     }

//     async login(req: Request, res: Response): Promise<void> {
//         try {
//             const { email, password } = req.body;
//             const { accessToken, refreshToken, user } = await this.authService.login(email, password)
//             this.setCookies(res, accessToken, refreshToken);
//             res.json({
//                 success: true,
//                 messafe: "Login successfull",
//                 user: { _id: user._id, name: user.name, email: user.email }
//             })
//         } catch (error: any) {
//             res.status(400).json({ success: false, message: error.message })
//         }
//     }

//     async refresh(req: Request, res: Response): Promise<void> {
//         try {
//             const old = req.cookies.refreshToken
//             if (!old) throw new Error("Missing refresh Token");
//             const { accessToken, refreshToken } = await this.authService.refresh(old);
//             this.setCookies(res, accessToken, refreshToken)
//             res.json({ sucess: true, accessToken, refreshToken })
//         } catch (error: any) {
//             res.status(402).json({ success: false, message: error.message })
//         }
//     }


//     async logout(req: Request, res: Response): Promise<void> {
//         const token = req.cookies.refreshToken;
//         if (token) await this.authService.logout(token);
//         res.clearCookie("accessToken");
//         res.clearCookie("refreshToken");

//         res.json({ success: true, message: "Logged out" });
//     }


//     // token setting
//     private setCookies(res: Response, access: string, refresh: string) {
//         const isProd = process.env.NODE_ENV === "production";
//         res.cookie("accessToken", access, {
//             httpOnly: true,
//             secure: isProd,
//             sameSite: "strict",
//             maxAge: 15 * 60 * 1000
//         })

//         res.cookie("refreshToken", refresh, {
//             httpOnly: true,
//             secure: isProd,
//             sameSite: "strict",
//             maxAge: 7 * 24 * 60 * 60 * 1000
//         })
//     }
// }

import { Request, Response } from "express";
import { AuthService } from "../../services/auth.servise.ts";
import { IAuthController } from "../interface/IauthController.ts";

export class AuthController implements IAuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, phone } = req.body;
      const result = await this.authService.signup({ name, email, password, phone });
      res.status(201).json({
        success: true,
        message: "User registered successfully. OTP sent to email.",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
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

  async login(req: Request, res: Response): Promise<void> {
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

  async refresh(req: Request, res: Response): Promise<void> {
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

  async logout(req: Request, res: Response): Promise<void> {
    const token = req.cookies.refreshToken;
    if (token) await this.authService.logout(token);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ success: true, message: "Logged out" });
  }

  private setCookies(res: Response, access: string, refresh: string) {
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

