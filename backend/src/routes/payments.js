import express from "express";
import { ReceiptService } from "../services/receipt/ReceiptService.js";
import { UserRepository } from "../models/User.js";

const router = express.Router();

/**
 * POST /api/payments/verify-and-receipt
 * Records token payment, credits user Dragon Gold in database, and delivers official email receipt.
 */
router.post("/verify-and-receipt", async (req, res) => {
  try {
    const {
      userId,
      email,
      userName,
      walletAddress,
      txHash,
      network = "Ethereum Network",
      item,
      amountPaid,
      initialBalance,
      remainingBalance,
    } = req.body;

    if (!item) {
      return res.status(400).json({ error: "Item specification is required." });
    }

    let updatedUser = null;

    // 1. Credit in-game gold if this is a gold bundle and user is authenticated
    if (item.goldAmount && userId) {
      try {
        const user = await UserRepository.findById(userId);
        if (user) {
          const newCoins = (Number(user.coins) || 0) + Number(item.goldAmount);
          updatedUser = await UserRepository.updateById(userId, { coins: newCoins });
          console.log(`[Payments] Credited +${item.goldAmount} Dragon Gold to user ${user.name} (${userId}). Total: ${newCoins}`);
        }
      } catch (err) {
        console.warn("[Payments] Failed to credit coins to database user:", err.message);
      }
    }

    // 2. Generate official receipt and dispatch email
    const receiptResult = await ReceiptService.sendPurchaseReceipt({
      email,
      userName,
      walletAddress,
      txHash,
      network,
      item,
      amountPaid: amountPaid || `${item.priceEth || "0.005"} ETH`,
      initialBalance,
      remainingBalance,
    });

    return res.json({
      success: true,
      receiptId: receiptResult.receiptId,
      message: receiptResult.message,
      updatedCoins: updatedUser ? updatedUser.coins : undefined,
      receipt: {
        id: receiptResult.receiptId,
        date: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
        item: item.name,
        amount: amountPaid || `${item.priceEth || "0.005"} ETH`,
        goldAmount: item.goldAmount,
        walletAddress,
        txHash,
        network,
        email,
        initialBalance,
        remainingBalance,
      },
    });
  } catch (err) {
    console.error("[Payments] Error processing payment receipt:", err);
    return res.status(500).json({ error: "Internal server error processing purchase receipt." });
  }
});

export default router;
