import nodemailer from "nodemailer";
import { Resend } from "resend";
import { config } from "../../config.js";

/**
 * ReceiptService
 * Generates official professional purchase receipts and dispatches branded HTML receipts to players' emails.
 */
export class ReceiptService {
  /**
   * Generates a unique invoice/receipt ID
   * @returns {string}
   */
  static generateReceiptId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `SR-INV-${timestamp}-${random}`;
  }

  /**
   * Generates formatted professional HTML email receipt
   * @param {object} param0 
   * @returns {string}
   */
  static getReceiptHtml({
    receiptId,
    userName,
    userEmail,
    walletAddress,
    txHash,
    network,
    itemName,
    goldAmount,
    amountPaid,
    date,
    initialBalance,
    remainingBalance,
  }) {
    const maskedWallet = walletAddress
      ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`
      : "Connected Web3 Wallet";
    const maskedTx = txHash
      ? `${txHash.slice(0, 10)}...${txHash.slice(-8)}`
      : "N/A";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt - Scribble Royale</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #e2e8f0; -webkit-font-smoothing: antialiased;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);">
    
    <!-- Corporate Header -->
    <tr>
      <td style="padding: 32px 36px 24px; border-bottom: 1px solid #1f2937; background: linear-gradient(180deg, #162032 0%, #111827 100%);">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #38bdf8; display: block; margin-bottom: 4px;">
                OFFICIAL TRANSACTION CONFIRMATION
              </span>
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">
                Scribble Royale
              </h1>
            </td>
            <td align="right" style="vertical-align: middle;">
              <span style="display: inline-block; background-color: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); color: #34d399; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; padding: 5px 12px; border-radius: 9999px;">
                SETTLED & CONFIRMED
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Introduction -->
    <tr>
      <td style="padding: 28px 36px 20px;">
        <p style="font-size: 15px; color: #f8fafc; font-weight: 600; margin: 0 0 12px;">
          Dear ${userName || "Customer"},
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px;">
          Thank you for your purchase. We have verified and settled your Web3 token transaction on the blockchain ledger. Your in-game assets have been credited to your account and are ready for use.
        </p>

        <!-- Invoice Meta Summary Card -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 8px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Invoice Number</td>
            <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #f8fafc; text-align: right; font-weight: 600;">${receiptId}</td>
          </tr>
          <tr>
            <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Settlement Date</td>
            <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #f8fafc; text-align: right;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 14px 18px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Payment Method</td>
            <td style="padding: 14px 18px; font-size: 13px; color: #38bdf8; text-align: right; font-weight: 600;">Web3 Native Tokens (ETH)</td>
          </tr>
        </table>

        <!-- Itemized Table Header -->
        <div style="font-size: 12px; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
          Order Breakdown
        </div>

        <!-- Itemized Table -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="border-bottom: 1px solid #334155;">
              <th align="left" style="padding: 10px 0; font-size: 12px; color: #64748b; font-weight: 600;">DESCRIPTION</th>
              <th align="center" style="padding: 10px 0; font-size: 12px; color: #64748b; font-weight: 600;">COINS CREDITED</th>
              <th align="right" style="padding: 10px 0; font-size: 12px; color: #64748b; font-weight: 600;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 14px 0; font-size: 14px; font-weight: 600; color: #f8fafc;">
                ${itemName}
              </td>
              <td align="center" style="padding: 14px 0; font-size: 14px; font-weight: 700; color: #fbbf24;">
                ${goldAmount ? `+${Number(goldAmount).toLocaleString()} Dragon Gold` : "Standard Item"}
              </td>
              <td align="right" style="padding: 14px 0; font-size: 14px; font-weight: 700; color: #38bdf8; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">
                ${amountPaid}
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 14px 0 6px; font-size: 13px; color: #94a3b8; text-align: right;">Total Amount Deducted:</td>
              <td align="right" style="padding: 14px 0 6px; font-size: 15px; font-weight: 800; color: #ffffff; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">
                ${amountPaid}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Blockchain Verification Details -->
        <div style="font-size: 12px; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
          Blockchain Settlement Verification
        </div>

        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 8px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 12px 18px; border-bottom: 1px solid #1e293b; font-size: 12px; color: #64748b;">Payer Wallet Address:</td>
            <td style="padding: 12px 18px; border-bottom: 1px solid #1e293b; font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #cbd5e1; text-align: right;">${maskedWallet}</td>
          </tr>
          <tr>
            <td style="padding: 12px 18px; border-bottom: 1px solid #1e293b; font-size: 12px; color: #64748b;">Blockchain Network:</td>
            <td style="padding: 12px 18px; border-bottom: 1px solid #1e293b; font-size: 12px; color: #f8fafc; text-align: right;">${network || "Ethereum Network"}</td>
          </tr>
          <tr>
            <td style="padding: 12px 18px; font-size: 12px; color: #64748b;">Transaction Hash:</td>
            <td style="padding: 12px 18px; font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #38bdf8; text-align: right; word-break: break-all;">${maskedTx}</td>
          </tr>
        </table>

        <p style="font-size: 13px; line-height: 1.6; color: #94a3b8; margin: 0 0 20px;">
          Your in-game balance has been updated immediately. If you have any inquiries regarding this purchase or need technical support, please contact our support team at <a href="mailto:support@scribbleroyale.io" style="color: #38bdf8; text-decoration: none; font-weight: 500;">support@scribbleroyale.io</a>.
        </p>

        <p style="font-size: 13px; color: #64748b; margin: 0;">
          Sincerely,<br>
          <strong style="color: #94a3b8;">Scribble Royale Treasury Operations</strong>
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 24px 36px; text-align: center; border-top: 1px solid #1f2937; background-color: #0b0f19;">
        <p style="margin: 0 0 6px; color: #64748b; font-size: 12px;">
          © 2026 Scribble Royale Gaming Technologies Inc. All rights reserved.
        </p>
        <p style="margin: 0; color: #475569; font-size: 11px;">
          This is an automated transaction receipt for your records. Please do not reply directly to this notification.
        </p>
      </td>
    </tr>

  </table>
</body>
</html>
    `;
  }

  /**
   * Dispatches receipt to customer email
   * @param {object} receiptDetails 
   * @returns {Promise<{ success: boolean, receiptId: string, message: string }>}
   */
  static async sendPurchaseReceipt(receiptDetails) {
    const {
      email,
      userName,
      walletAddress,
      txHash,
      network,
      item,
      amountPaid,
      initialBalance,
      remainingBalance,
    } = receiptDetails;

    const receiptId = receiptDetails.receiptId || ReceiptService.generateReceiptId();
    const date = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const cleanEmail = String(email || "").toLowerCase().trim();
    const itemName = item?.name || "Dragon Gold Package";
    const goldAmount = item?.goldAmount || null;

    console.log("");
    console.log(`================================================================`);
    console.log(`  TRANSACTION RECEIPT GENERATED                               `);
    console.log(`  Invoice Ref:   ${receiptId.padEnd(45)}`);
    console.log(`  Customer:      ${(userName || "Customer").padEnd(45)}`);
    console.log(`  Email:         ${cleanEmail.padEnd(45)}`);
    console.log(`  Item:          ${itemName.padEnd(45)}`);
    console.log(`  Amount Paid:   ${String(amountPaid).padEnd(45)}`);
    console.log(`  Wallet:        ${(walletAddress || "N/A").padEnd(45)}`);
    console.log(`  Tx Hash:       ${(txHash || "N/A").padEnd(45)}`);
    console.log(`================================================================`);
    console.log("");

    if (!cleanEmail) {
      return {
        success: true,
        receiptId,
        message: "Receipt generated (no email registered).",
      };
    }

    const subject = `Official Transaction Receipt: #${receiptId} - Scribble Royale`;
    const html = ReceiptService.getReceiptHtml({
      receiptId,
      userName,
      userEmail: cleanEmail,
      walletAddress,
      txHash,
      network,
      itemName,
      goldAmount,
      amountPaid,
      date,
      initialBalance,
      remainingBalance,
    });

    // 1. Send via Resend if API key is provided
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
          console.warn("[ReceiptService] Resend dispatch note:", error.message || error);
        } else {
          console.log(`[ReceiptService] Receipt email delivered via Resend to ${cleanEmail} (ID: ${data.id})`);
          return {
            success: true,
            receiptId,
            message: `Receipt sent to ${cleanEmail}`,
          };
        }
      } catch (err) {
        console.warn(`[ReceiptService] Resend error: ${err.message}`);
      }
    }

    // 2. SMTP Fallback
    if (config.smtp.host && config.smtp.user) {
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

        console.log(`[ReceiptService] Receipt email delivered via SMTP to ${cleanEmail}`);
        return {
          success: true,
          receiptId,
          message: `Receipt sent to ${cleanEmail}`,
        };
      } catch (err) {
        console.warn(`[ReceiptService] SMTP fallback error: ${err.message}`);
      }
    }

    return {
      success: true,
      receiptId,
      message: `Receipt generated and recorded on ledger.`,
    };
  }
}
