import { query, pgStatus } from "../db/postgres.js";

// Formatter to map SQL snake_case to JavaScript camelCase
function formatSqlTransaction(row) {
  if (!row) return null;
  return {
    id: row.id,
    receiptId: row.id,
    userId: row.user_id,
    email: row.email,
    userName: row.user_name,
    itemId: row.item_id,
    item: row.item_name,
    itemName: row.item_name,
    category: row.item_category || "general",
    amount: row.amount,
    goldAmount: Number(row.gold_amount || 0),
    method: row.payment_method,
    paymentMethod: row.payment_method,
    status: row.status || "COMPLETED",
    walletAddress: row.wallet_address || "",
    hash: row.tx_hash || "",
    txHash: row.tx_hash || "",
    network: row.network || "Ethereum Network",
    initialBalance: row.initial_balance || "",
    remainingBalance: row.remaining_balance || "",
    date: row.created_at
      ? new Date(row.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
      : new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
    createdAt: row.created_at,
  };
}

// In-Memory Storage Adapter for resilient fallback
class MemoryTransactionStore {
  constructor() {
    this.transactions = new Map();
  }

  _format(tx) {
    if (!tx) return null;
    return {
      ...tx,
      receiptId: tx.id,
      item: tx.itemName || tx.item,
      itemName: tx.itemName || tx.item,
      method: tx.paymentMethod || tx.method,
      paymentMethod: tx.paymentMethod || tx.method,
      hash: tx.txHash || tx.hash,
      txHash: tx.txHash || tx.hash,
      date: tx.createdAt
        ? new Date(tx.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
        : new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
    };
  }

  async create(data) {
    const id = data.id || `TX-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const newTx = {
      id,
      receiptId: id,
      userId: data.userId || null,
      email: String(data.email || "").toLowerCase().trim(),
      userName: data.userName || "Warrior",
      itemId: data.itemId || data.item?.id || "",
      item: data.itemName || data.item?.name || "Dragon Gold Package",
      itemName: data.itemName || data.item?.name || "Dragon Gold Package",
      category: data.category || data.item?.category || "general",
      amount: data.amount || "0.005 ETH",
      goldAmount: Number(data.goldAmount || data.item?.goldAmount || 0),
      method: data.paymentMethod || data.method || "Web3 MetaMask",
      paymentMethod: data.paymentMethod || data.method || "Web3 MetaMask",
      status: data.status || "COMPLETED",
      walletAddress: data.walletAddress || "",
      hash: data.txHash || data.hash || "0x00000000",
      txHash: data.txHash || data.hash || "0x00000000",
      network: data.network || "Ethereum Network",
      initialBalance: data.initialBalance || "",
      remainingBalance: data.remainingBalance || "",
      createdAt: now,
    };

    this.transactions.set(id, newTx);
    return this._format(newTx);
  }

  async findByUserId(userId) {
    if (!userId) return [];
    const list = Array.from(this.transactions.values()).filter((t) => String(t.userId) === String(userId));
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((t) => this._format(t));
  }

  async findByEmail(email) {
    if (!email) return [];
    const clean = String(email).toLowerCase().trim();
    const list = Array.from(this.transactions.values()).filter(
      (t) => String(t.email).toLowerCase().trim() === clean
    );
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((t) => this._format(t));
  }

  async find(filter = {}) {
    let list = Array.from(this.transactions.values());

    if (filter.userId) {
      list = list.filter((t) => String(t.userId) === String(filter.userId));
    }
    if (filter.email) {
      const clean = String(filter.email).toLowerCase().trim();
      list = list.filter((t) => String(t.email).toLowerCase().trim() === clean);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (t) =>
          (t.itemName && t.itemName.toLowerCase().includes(q)) ||
          (t.id && t.id.toLowerCase().includes(q)) ||
          (t.hash && t.hash.toLowerCase().includes(q)) ||
          (t.userName && t.userName.toLowerCase().includes(q))
      );
    }
    if (filter.category && filter.category !== "all") {
      list = list.filter((t) => t.category === filter.category);
    }

    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((t) => this._format(t));
  }

  async count(filter = {}) {
    const res = await this.find(filter);
    return res.length;
  }
}

const memoryStore = new MemoryTransactionStore();

/**
 * Unified Transaction Repository with PostgreSQL + Memory fallback
 */
export const TransactionRepository = {
  async create(data) {
    const id = data.id || data.receiptId || `TX-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanEmail = String(data.email || "").toLowerCase().trim();
    const itemName = data.itemName || data.item?.name || data.item || "In-Game Relic";
    const itemId = data.itemId || data.item?.id || "";
    const category = data.category || data.item?.category || "general";
    const goldAmount = Number(data.goldAmount ?? data.item?.goldAmount ?? 0);
    const amount = String(data.amount || data.amountPaid || "0.005 ETH");
    const paymentMethod = data.paymentMethod || data.method || "Web3 MetaMask";
    const status = data.status || "COMPLETED";

    if (pgStatus.isConnected) {
      try {
        const sql = `
          INSERT INTO transactions (
            id, user_id, email, user_name, item_id, item_name, item_category,
            amount, gold_amount, payment_method, status, wallet_address,
            tx_hash, network, initial_balance, remaining_balance, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11, $12,
            $13, $14, $15, $16, NOW()
          )
          RETURNING *;
        `;
        const params = [
          id,
          data.userId || null,
          cleanEmail,
          data.userName || "Warrior",
          itemId,
          itemName,
          category,
          amount,
          goldAmount,
          paymentMethod,
          status,
          data.walletAddress || "",
          data.txHash || data.hash || "",
          data.network || "Ethereum Network",
          data.initialBalance || "",
          data.remainingBalance || "",
        ];

        const res = await query(sql, params);
        if (res.rows.length > 0) {
          return formatSqlTransaction(res.rows[0]);
        }
      } catch (err) {
        console.warn("[TransactionRepo] Postgres create failed, fallback to memory:", err.message);
      }
    }

    return memoryStore.create({
      ...data,
      id,
      email: cleanEmail,
      itemName,
      itemId,
      category,
      goldAmount,
      amount,
      paymentMethod,
      status,
    });
  },

  async findByUserId(userId) {
    if (!userId) return [];
    if (pgStatus.isConnected) {
      try {
        const res = await query(
          `SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC;`,
          [String(userId)]
        );
        return res.rows.map(formatSqlTransaction);
      } catch (err) {
        console.warn("[TransactionRepo] Postgres findByUserId failed:", err.message);
      }
    }
    return memoryStore.findByUserId(userId);
  },

  async findByEmail(email) {
    if (!email) return [];
    const clean = String(email).toLowerCase().trim();
    if (pgStatus.isConnected) {
      try {
        const res = await query(
          `SELECT * FROM transactions WHERE LOWER(email) = $1 ORDER BY created_at DESC;`,
          [clean]
        );
        return res.rows.map(formatSqlTransaction);
      } catch (err) {
        console.warn("[TransactionRepo] Postgres findByEmail failed:", err.message);
      }
    }
    return memoryStore.findByEmail(clean);
  },

  async findByUserOrEmail(userId, email) {
    if (pgStatus.isConnected) {
      try {
        let sql = `SELECT * FROM transactions WHERE 1=0`;
        const params = [];
        let idx = 1;

        if (userId && email) {
          sql = `SELECT * FROM transactions WHERE user_id = $${idx++} OR LOWER(email) = $${idx++} ORDER BY created_at DESC;`;
          params.push(String(userId), String(email).toLowerCase().trim());
        } else if (userId) {
          sql = `SELECT * FROM transactions WHERE user_id = $${idx++} ORDER BY created_at DESC;`;
          params.push(String(userId));
        } else if (email) {
          sql = `SELECT * FROM transactions WHERE LOWER(email) = $${idx++} ORDER BY created_at DESC;`;
          params.push(String(email).toLowerCase().trim());
        }

        const res = await query(sql, params);
        return res.rows.map(formatSqlTransaction);
      } catch (err) {
        console.warn("[TransactionRepo] Postgres findByUserOrEmail failed:", err.message);
      }
    }

    const byUser = userId ? await memoryStore.findByUserId(userId) : [];
    const byEmail = email ? await memoryStore.findByEmail(email) : [];
    const combined = [...byUser, ...byEmail];
    const unique = Array.from(new Map(combined.map((t) => [t.id, t])).values());
    return unique.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  },

  async find(filter = {}) {
    if (pgStatus.isConnected) {
      try {
        const conditions = [];
        const params = [];
        let index = 1;

        if (filter.userId) {
          conditions.push(`user_id = $${index++}`);
          params.push(String(filter.userId));
        }
        if (filter.email) {
          conditions.push(`LOWER(email) = $${index++}`);
          params.push(String(filter.email).toLowerCase().trim());
        }
        if (filter.category && filter.category !== "all") {
          conditions.push(`item_category = $${index++}`);
          params.push(filter.category);
        }
        if (filter.search) {
          conditions.push(`(
            item_name ILIKE $${index} OR
            id ILIKE $${index} OR
            tx_hash ILIKE $${index} OR
            user_name ILIKE $${index}
          )`);
          params.push(`%${filter.search}%`);
          index++;
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `SELECT * FROM transactions ${where} ORDER BY created_at DESC;`;

        const res = await query(sql, params);
        return res.rows.map(formatSqlTransaction);
      } catch (err) {
        console.warn("[TransactionRepo] Postgres find failed:", err.message);
      }
    }
    return memoryStore.find(filter);
  },

  async count(filter = {}) {
    if (pgStatus.isConnected) {
      try {
        const conditions = [];
        const params = [];
        let index = 1;

        if (filter.userId) {
          conditions.push(`user_id = $${index++}`);
          params.push(String(filter.userId));
        }
        if (filter.email) {
          conditions.push(`LOWER(email) = $${index++}`);
          params.push(String(filter.email).toLowerCase().trim());
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `SELECT COUNT(*) AS total FROM transactions ${where};`;
        const res = await query(sql, params);
        return Number(res.rows[0]?.total || 0);
      } catch (err) {
        console.warn("[TransactionRepo] Postgres count failed:", err.message);
      }
    }
    return memoryStore.count(filter);
  },
};

export default TransactionRepository;
