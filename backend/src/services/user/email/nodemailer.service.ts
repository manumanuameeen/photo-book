import type { IEmailservice } from "./IEmail.servise.ts";

import { mailTransport } from "../../../config/email.ts";

export class NodeMailerService implements IEmailservice {
  async sendOtp(email: string, otp: string, name: string): Promise<void> {
    try {
      console.log("email from nodemailer",email)
      const mailOptions = {
        from: `"photobook app" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "your PHTOT-BOOK verification code",
        html: this.getotpEmailTemplate(name, otp),
      };

      await mailTransport.sendMail(mailOptions);
      console.log(`otp eamil sent successfulyy to ${email}`);
      console.log(`otp :${otp}`);
    } catch (error: any) {
      throw new Error("Failed to send verification eamil. Please try again.", error);
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"PhotoBook Team" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Welcome to Photo-Book",
        html: this.getWelcomeEmailTemplate(name),
      };
      await mailTransport.sendMail(mailOptions);
      console.log(` Welcome email sent to ${email}`);
    } catch (error: any) {
      console.error(" Failed to send welcome email:", error.message);
    }
  }

  //templata

  private getotpEmailTemplate(name: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 40px 20px;
          }
          .container { 
            background: white; 
            max-width: 560px;
            margin: 0 auto;
            padding: 40px 30px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #667eea;
            margin: 0;
            font-size: 28px;
          }
          .otp-box { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            text-align: center;
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            border-radius: 12px;
            margin: 30px 0;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }
          .content {
            color: #333;
            line-height: 1.6;
          }
          .footer { 
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 13px;
            color: #999;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📸 PhotoBook</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Welcome to <strong>PhotoBook</strong>! To complete your registration, please verify your email address using the code below:</p>
            
            <div class="otp-box">${otp}</div>
            
            <p>This verification code is valid for <strong>2 minutes</strong>.</p>
            
            <div class="warning">
              ⚠️ <strong>Security Notice:</strong> If you didn't create this account, please ignore this email.
            </div>
          </div>
          <div class="footer">
            <p>© 2025 PhotoBook. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 40px 20px;
          }
          .container { 
            background: white; 
            max-width: 560px;
            margin: 0 auto;
            padding: 40px 30px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          .celebration {
            text-align: center;
            font-size: 48px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="celebration">🎉</div>
          <h1 style="color: #667eea; text-align: center;">Welcome to PhotoBook!</h1>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your account has been successfully verified! You can now:</p>
          <ul>
            <li>📷 Upload and organize your favorite photos</li>
            <li>📁 Create beautiful photo albums</li>
            <li>🤝 Share memories with friends and family</li>
          </ul>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}" 
ends and family</li>
          </ul>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 6px;
                      display: inline-block;">
              Get Started →
            </a>
          </p>
        </div>
      </body>
      </html>
    `;
  }
}
