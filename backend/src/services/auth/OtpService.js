import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { config } from "../../config.js";
import { OtpRepository } from "../../models/Otp.js";

export class OtpService {
  /**
   * Generates a 6-digit numeric OTP
   */
  static generateCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Generates the styled Dragon HTML email template
   */
  static getEmailHtml(otp, purpose) {
    return `
      <div style="background-color: #090706; color: #fef3c7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 36px 24px; border-radius: 14px; border: 1px solid #f59e0b; max-width: 520px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #fbbf24; font-size: 26px; text-transform: uppercase; margin: 0; letter-spacing: 2px;">🐉 Scribble Royale</h1>
          <p style="color: #fcd34d; font-size: 14px; margin: 6px 0 0; opacity: 0.85;">Dragon Dynasty Authentication</p>
        </div>
        <hr style="border: 0; border-top: 1px solid rgba(245, 158, 11, 0.3); margin: 20px 0;" />
        <p style="font-size: 16px; line-height: 1.5; color: #fef3c7;">Greetings Warrior,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #fef3c7; opacity: 0.9;">
          Use the one-time verification scroll code below to complete your registration and claim your battle chamber:
        </p>
        <div style="background: rgba(245, 158, 11, 0.12); border: 2px dashed #fbbf24; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #ffd700; font-family: monospace;">${otp}</span>
        </div>
        <p style="color: #d97706; font-size: 12px; text-align: center; margin: 20px 0 0;">
          This code is valid for ${config.otpExpiryMinutes} minutes. If you did not request this scroll, please disregard.
        </p>
      </div>
    `;
  }

  /**
   * Sends an OTP code to user's email and saves it to store
   * @param {string} email 
   * @param {string} purpose 
   * @returns {Promise<{ success: boolean, message: string, simulatedOtp?: string }>}
   */
  static async sendOtp(email, purpose = "signup") {
    const cleanEmail = String(email).toLowerCase().trim();
    const otp = OtpService.generateCode();

    // Store in DB
    await OtpRepository.save(cleanEmail, otp, purpose, config.otpExpiryMinutes);

    // Visual console notification for rapid dev testing
    console.log("╔════════════════════════════════════════════════════════════════════════╗");
    console.log(`║ 🐉 SCRIBBLE ROYALE OTP CODE FOR: ${cleanEmail.padEnd(37)} ║`);
    console.log(`║ 🔑 CODE: [ ${otp} ] (Valid for ${config.otpExpiryMinutes} minutes)                        ║`);
    console.log(`║ 🎯 PURPOSE: ${purpose.toUpperCase().padEnd(58)} ║`);
    console.log("╚════════════════════════════════════════════════════════════════════════╝");

    const subject =
      purpose === "signup"
        ? "🐉 Scribble Royale — Your Warrior Verification Code"
        : "🐉 Scribble Royale — Password Reset Code";
    const html = OtpService.getEmailHtml(otp, purpose);

    // 1. Dispatch via Resend if API Key is configured
    if (config.resendApiKey) {
      try {
        const resend = new Resend(config.resendApiKey);
        const { data, error } = await resend.emails.send({
          from: config.resendFrom,
          to: cleanEmail,
          subject,
          html,
        });

        if (error) {
          console.warn("[OtpService] Resend API notice:", error.message || error);
          if (error.statusCode === 403 && error.message?.includes("only send testing emails to your own email")) {
            return {
              success: true,
              message: `Code generated! Note: Resend test mode delivers to your registered account email (check terminal or auto-fill below).`,
              simulatedOtp: otp,
            };
          }
        } else {
          console.log(`[OtpService] ✉️ Email sent successfully via Resend to ${cleanEmail} (ID: ${data.id})`);
          return { success: true, message: `Verification code sent to ${cleanEmail}` };
        }
      } catch (err) {
        console.warn(`[OtpService] Resend dispatch error: ${err.message}.`);
      }
    }

    // 2. Dispatch via SMTP / Nodemailer fallback if configured
    if (config.smtp.host && config.smtp.user && config.smtp.pass) {
      try {
        const transporter = nodemailer.createTransport({
          host: config.smtp.host,
          port: config.smtp.port,
          secure: config.smtp.port === 465,
          auth: {
            user: config.smtp.user,
            pass: config.smtp.pass,
          },
        });

        await transporter.sendMail({
          from: config.smtp.from,
          to: cleanEmail,
          subject,
          html,
        });

        return { success: true, message: `Verification code sent to ${cleanEmail}` };
      } catch (err) {
        console.warn(`[OtpService] SMTP dispatch failed: ${err.message}.`);
      }
    }

    return {
      success: true,
      message: `Verification code dispatched to ${cleanEmail} (Simulated for dev: check terminal)`,
      simulatedOtp: otp,
    };
  }

  /**
   * Verifies an OTP submitted by user
   * @param {string} email 
   * @param {string} submittedOtp 
   * @param {string} purpose 
   * @param {boolean} consume - Whether to delete the OTP record upon successful match
   * @returns {Promise<{ valid: boolean, error?: string }>}
   */
  static async verifyOtp(email, submittedOtp, purpose = "signup", consume = true) {
    const cleanEmail = String(email).toLowerCase().trim();
    const cleanOtp = String(submittedOtp || "").trim();

    if (!cleanOtp) {
      return { valid: false, error: "Verification code is required" };
    }

    const record = await OtpRepository.find(cleanEmail, purpose);
    if (!record) {
      return { valid: false, error: "Invalid or expired verification code" };
    }

    if (record.attempts >= 5) {
      await OtpRepository.remove(cleanEmail, purpose);
      return { valid: false, error: "Too many failed attempts. Please request a new code." };
    }

    if (record.otp !== cleanOtp) {
      await OtpRepository.incrementAttempts(cleanEmail, purpose);
      return { valid: false, error: "Incorrect verification code. Please check and try again." };
    }

    // Only remove if consume is explicitly requested (e.g. at final signup)
    if (consume) {
      await OtpRepository.remove(cleanEmail, purpose);
    }
    return { valid: true };
  }
}

export default OtpService;
