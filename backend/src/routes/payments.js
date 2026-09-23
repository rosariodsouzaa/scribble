import express from "express";
import { ReceiptService } from "../services/receipt/ReceiptService.js";
import { UserRepository } from "../models/User.js";
import { TransactionRepository } from "../models/Transaction.js";

const router = express.Router();

/**
 * POST /api/payments/verify-and-receipt
 * Records token payment, credits user Dragon Gold in database, stores transaction in ledger, and delivers official email receipt.
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
    let dbUser = null;

    if (userId) {
      try {
        dbUser = await UserRepository.findById(userId);
      } catch (err) {
        console.warn("[Payments] Failed to fetch database user:", err.message);
      }
    }

    // 1. Credit in-game gold if this is a gold bundle and user is authenticated
    if (item.goldAmount && (dbUser || userId)) {
      try {
        const currentCoins = Number(dbUser?.coins ?? 0);
        const newCoins = currentCoins + Number(item.goldAmount);
        updatedUser = await UserRepository.updateById(userId, { coins: newCoins });
        console.log(`[Payments] Credited +${item.goldAmount} Dragon Gold to user (${userId}). Total: ${newCoins}`);
      } catch (err) {
        console.warn("[Payments] Failed to credit coins to database user:", err.message);
      }
    }

    const targetEmail = String(email || dbUser?.email || "").trim();
    const targetName = userName || dbUser?.name || "Warrior";
    const finalAmountPaid = amountPaid || `${item.priceEth || "0.005"} ETH`;

    // 2. Generate official receipt and dispatch email
    const receiptResult = await ReceiptService.sendPurchaseReceipt({
      email: targetEmail,
      userName: targetName,
      walletAddress,
      txHash,
      network,
      item,
      amountPaid: finalAmountPaid,
      initialBalance,
      remainingBalance,
    });

    // 3. Store permanent transaction record in the database ledger
    let savedTransaction = null;
    try {
      savedTransaction = await TransactionRepository.create({
        id: receiptResult.receiptId,
        userId: userId || dbUser?.id,
        email: targetEmail,
        userName: targetName,
        itemId: item.id || "",
        itemName: item.name,
        category: item.category || "gold",
        amount: finalAmountPaid,
        goldAmount: item.goldAmount || 0,
        paymentMethod: walletAddress ? "MetaMask (ETH)" : "Web3 Native Tokens",
        status: "COMPLETED",
        walletAddress: walletAddress || "",
        txHash: txHash || "",
        network: network || "Ethereum Network",
        initialBalance: initialBalance || "",
        remainingBalance: remainingBalance || "",
      });
      console.log(`[Payments] 📜 Transaction ${receiptResult.receiptId} recorded to ledger.`);
    } catch (txErr) {
      console.warn("[Payments] Failed to record transaction in database ledger:", txErr.message);
    }

    return res.json({
      success: true,
      receiptId: receiptResult.receiptId,
      message: receiptResult.message,
      updatedCoins: updatedUser ? updatedUser.coins : undefined,
      transaction: savedTransaction,
      receipt: {
        id: receiptResult.receiptId,
        date: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
        item: item.name,
        amount: finalAmountPaid,
        goldAmount: item.goldAmount,
        walletAddress,
        txHash,
        network,
        email: targetEmail,
        initialBalance,
        remainingBalance,
      },
    });
  } catch (err) {
    console.error("[Payments] Error processing payment receipt:", err);
    return res.status(500).json({ error: "Internal server error processing purchase receipt." });
  }
});

/**
 * POST /api/payments/record
 * Records an in-game Gold Vault or item acquisition in the ledger
 */
router.post("/record", async (req, res) => {
  try {
    const {
      userId,
      email,
      userName,
      item,
      amount,
      paymentMethod = "Dragon Gold Vault",
      status = "COMPLETED",
      txHash,
      walletAddress,
      network,
      initialBalance,
      remainingBalance,
    } = req.body;

    if (!item) {
      return res.status(400).json({ error: "Item specification is required." });
    }

    const saved = await TransactionRepository.create({
      userId,
      email,
      userName,
      itemId: item.id || "",
      itemName: item.name || item,
      category: item.category || "cosmetic",
      amount: amount || (item.goldCost ? `${item.goldCost.toLocaleString()} Gold` : "0 Gold"),
      goldAmount: item.goldAmount || 0,
      paymentMethod,
      status,
      walletAddress: walletAddress || "",
      txHash: txHash || (paymentMethod.includes("Gold") ? "VAULT-SETTLED" : "0x00000000"),
      network: network || "Dragon Empire Realm",
      initialBalance: initialBalance || "",
      remainingBalance: remainingBalance || "",
    });

    return res.json({
      success: true,
      transaction: saved,
    });
  } catch (err) {
    console.error("[Payments] Error recording transaction:", err);
    return res.status(500).json({ error: "Failed to record transaction." });
  }
});

/**
 * GET /api/payments/history
 * Fetches transaction history for a user by userId and/or email
 */
router.get("/history", async (req, res) => {
  try {
    const { userId, email, search, category } = req.query;

    let transactions = [];
    if (userId || email) {
      transactions = await TransactionRepository.findByUserOrEmail(userId, email);
    } else {
      transactions = await TransactionRepository.find({ search, category });
    }

    // Apply in-memory search and category filter if specified
    if (search) {
      const q = String(search).toLowerCase();
      transactions = transactions.filter(
        (t) =>
          (t.itemName && t.itemName.toLowerCase().includes(q)) ||
          (t.id && t.id.toLowerCase().includes(q)) ||
          (t.hash && t.hash.toLowerCase().includes(q))
      );
    }

    if (category && category !== "all") {
      transactions = transactions.filter((t) => t.category === category);
    }

    return res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err) {
    console.error("[Payments] Error fetching transaction history:", err);
    return res.status(500).json({ error: "Failed to fetch transaction history." });
  }
});

export default router;
