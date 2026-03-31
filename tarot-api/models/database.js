/**
 * Turso Database - 替换 sql.js 为 @libsql/client
 * 支持 Vercel Serverless 环境
 */
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

let db = null;

// 兼容层 - 将新API适配为旧API
const compat = {
  async getUserByUsername(username) {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE username = ?",
      args: [username]
    });
    return result.rows[0] || null;
  },

  async getUserById(id) {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE id = ?",
      args: [id]
    });
    return result.rows[0] || null;
  },

  async createUserWithPassword(id, username, password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    await db.execute({
      sql: "INSERT INTO users (id, username, password, points) VALUES (?, ?, ?, 50)",
      args: [id, username, hashedPassword]
    });
    return this.getUserById(id);
  },

  async updateUserPoints(id, delta) {
    const user = await this.getUserById(id);
    if (!user) return;
    const newPoints = Math.max(0, (user.points || 0) + delta);
    await db.execute({
      sql: "UPDATE users SET points = ? WHERE id = ?",
      args: [newPoints, id]
    });
  },

  async addTransaction(userId, type, amount, note, readingId = null) {
    const id = require('uuid').v4();
    await db.execute({
      sql: "INSERT INTO transactions (id, user_id, type, amount, note, related_id) VALUES (?, ?, ?, ?, ?, ?)",
      args: [id, userId, type, amount, note, readingId]
    });
  },

  async getTransactions(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const result = await db.execute({
      sql: "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
      args: [userId, limit, offset]
    });
    const countResult = await db.execute({
      sql: "SELECT COUNT(*) as total FROM transactions WHERE user_id = ?",
      args: [userId]
    });
    return {
      list: result.rows,
      total: countResult.rows[0]?.total || 0
    };
  },

  async checkin(userId) {
    const today = new Date().toISOString().split('T')[0];
    const yesterdayResult = await db.execute({
      sql: "SELECT last_checkin FROM users WHERE id = ?",
      args: [userId]
    });
    const lastCheckin = yesterdayResult.rows[0]?.last_checkin;
    
    let consecutiveDays = 1;
    if (lastCheckin) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (lastCheckin === yesterdayStr) {
        consecutiveDays += (yesterdayResult.rows[0]?.consecutive_days || 0);
      }
    }
    
    await db.execute({
      sql: "UPDATE users SET is_today_checkin = 1, last_checkin = datetime('now'), consecutive_days = ? WHERE id = ?",
      args: [consecutiveDays, userId]
    });
    
    // 签到奖励积分
    let pointsEarned = 5;
    if (consecutiveDays >= 7) pointsEarned = 10;
    if (consecutiveDays >= 30) pointsEarned = 20;
    
    await this.updateUserPoints(userId, pointsEarned);
    await this.addTransaction(userId, 'earn', pointsEarned, `连续签到${consecutiveDays}天奖励`);
    
    return { consecutiveDays, pointsEarned };
  },

  async getCheckins(userId) {
    const result = await db.execute({
      sql: "SELECT checkin_date FROM checkin_records WHERE user_id = ? ORDER BY checkin_date DESC",
      args: [userId]
    });
    return result.rows.map(r => ({ checkin_date: r.checkin_date }));
  },

  async saveReading(data) {
    const id = data.id || require('uuid').v4();
    await db.execute({
      sql: "INSERT OR REPLACE INTO divinations (id, user_id, username, question_type, spread_id, drawn_cards, interpretation_cache, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))",
      args: [id, data.user_id, data.user_id, data.question_type, data.spread_id, JSON.stringify(data.cards), JSON.stringify(data.interpretation)]
    });
    return { id };
  },

  async getReadingById(readingId) {
    const result = await db.execute({
      sql: "SELECT * FROM divinations WHERE id = ?",
      args: [readingId]
    });
    return result.rows[0] || null;
  },

  async getReadings(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const result = await db.execute({
      sql: "SELECT * FROM divinations WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
      args: [userId, limit, offset]
    });
    const countResult = await db.execute({
      sql: "SELECT COUNT(*) as total FROM divinations WHERE user_id = ?",
      args: [userId]
    });
    return {
      list: result.rows,
      total: countResult.rows[0]?.total || 0
    };
  },

  async getShare(userId, readingId) {
    const result = await db.execute({
      sql: "SELECT * FROM shares WHERE user_id = ? AND reading_id = ?",
      args: [userId, readingId]
    });
    return result.rows[0] || null;
  },

  async createShare(id, userId, readingId) {
    await db.execute({
      sql: "INSERT INTO shares (id, user_id, reading_id) VALUES (?, ?, ?)",
      args: [id, userId, readingId]
    });
  },

  // 订单相关
  async createOrder(order) {
    const id = require('uuid').v4();
    await db.execute({
      sql: "INSERT INTO orders (id, user_id, package_name, points, amount, status, created_at) VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'))",
      args: [id, order.userId, order.packageName, order.points, order.amount]
    });
    return { id };
  },

  async getOrder(id) {
    const result = await db.execute({
      sql: "SELECT * FROM orders WHERE id = ?",
      args: [id]
    });
    return result.rows[0] || null;
  },

  async updateOrderQRCode(orderId, qrcode) {
    await db.execute({
      sql: "UPDATE orders SET qrcode_url = ? WHERE id = ?",
      args: [qrcode, orderId]
    });
  },

  async updateOrderStatus(orderId, status) {
    await db.execute({
      sql: "UPDATE orders SET status = ? WHERE id = ?",
      args: [status, orderId]
    });
  },

  // 配置
  async getConfig(key) {
    const result = await db.execute({
      sql: "SELECT value FROM config WHERE key = ?",
      args: [key]
    });
    return result.rows[0]?.value || null;
  },

  async setConfig(key, value) {
    await db.execute({
      sql: "INSERT OR REPLACE INTO config (key, value, updated_at) VALUES (?, ?, datetime('now'))",
      args: [key, value]
    });
  },

  // 管理后台
  async getAllUsers(page = 1, limit = 20, search = '') {
    const offset = (page - 1) * limit;
    let sql = "SELECT * FROM users";
    let args = [];
    if (search) {
      sql += " WHERE username LIKE ?";
      args.push(`%${search}%`);
    }
    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    args.push(limit, offset);
    const result = await db.execute({ sql, args });
    const countResult = await db.execute({
      sql: search ? "SELECT COUNT(*) as total FROM users WHERE username LIKE ?" : "SELECT COUNT(*) as total FROM users",
      args: search ? [`%${search}%`] : []
    });
    return {
      list: result.rows,
      total: countResult.rows[0]?.total || 0
    };
  },

  async getStats() {
    const users = await db.execute("SELECT COUNT(*) as c FROM users");
    const divs = await db.execute("SELECT COUNT(*) as c FROM divinations");
    const today = await db.execute("SELECT COUNT(*) as c FROM divinations WHERE date(created_at) = date('now')");
    return {
      totalUsers: users.rows[0]?.c || 0,
      totalDivinations: divs.rows[0]?.c || 0,
      todayDivinations: today.rows[0]?.c || 0
    };
  }
};

// 初始化数据库连接
async function initDatabase() {
  if (db) return db;
  
  const dbUrl = process.env.TURSO_DATABASE_URL || 'file:local.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;
  
  db = createClient({
    url: dbUrl,
    authToken: authToken,
  });
  
  // 初始化表结构
  await initSchema();
  return db;
}

// 初始化表结构
async function initSchema() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      points INTEGER DEFAULT 50,
      is_today_checkin INTEGER DEFAULT 0,
      last_checkin TEXT,
      consecutive_days INTEGER DEFAULT 0,
      is_admin INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS divinations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      username TEXT,
      question_type TEXT NOT NULL,
      spread_id TEXT NOT NULL,
      drawn_cards TEXT,
      interpretation_cache TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS checkin_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      checkin_date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      note TEXT,
      related_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      package_name TEXT,
      points INTEGER,
      amount INTEGER,
      qrcode_url TEXT,
      status TEXT DEFAULT 'pending',
      paid_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS shares (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      reading_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  
  // 创建测试用户
  const testUser = await db.execute("SELECT id FROM users WHERE username = 'xiaolu'");
  if (testUser.rows.length === 0) {
    const hashedPassword = bcrypt.hashSync('123456', 10);
    await db.execute({
      sql: "INSERT INTO users (id, username, password, points, is_admin) VALUES (?, ?, ?, 50, 0)",
      args: [require('uuid').v4(), 'xiaolu', hashedPassword]
    });
  }
  
  // 创建管理员
  const adminUser = await db.execute("SELECT id FROM users WHERE username = 'admin'");
  if (adminUser.rows.length === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    await db.execute({
      sql: "INSERT INTO users (id, username, password, points, is_admin) VALUES (?, ?, ?, 100, 1)",
      args: [require('uuid').v4(), 'admin', hashedPassword]
    });
  }
}

// 获取所有卡牌
function getAllCards() {
  const cards = [];
  const majorArcana = [
    { id: 0, name: 'The Fool', name_cn: '愚人', arcana: 'major', suit: null },
    { id: 1, name: 'The Magician', name_cn: '魔术师', arcana: 'major', suit: null },
    { id: 2, name: 'The High Priestess', name_cn: '女祭司', arcana: 'major', suit: null },
    { id: 3, name: 'The Empress', name_cn: '女皇', arcana: 'major', suit: null },
    { id: 4, name: 'The Emperor', name_cn: '皇帝', arcana: 'major', suit: null },
    { id: 5, name: 'The Hierophant', name_cn: '教皇', arcana: 'major', suit: null },
    { id: 6, name: 'The Lovers', name_cn: '恋人', arcana: 'major', suit: null },
    { id: 7, name: 'The Chariot', name_cn: '战车', arcana: 'major', suit: null },
    { id: 8, name: 'Strength', name_cn: '力量', arcana: 'major', suit: null },
    { id: 9, name: 'The Hermit', name_cn: '隐士', arcana: 'major', suit: null },
    { id: 10, name: 'Wheel of Fortune', name_cn: '命运之轮', arcana: 'major', suit: null },
    { id: 11, name: 'Justice', name_cn: '正义', arcana: 'major', suit: null },
    { id: 12, name: 'The Hanged Man', name_cn: '倒吊人', arcana: 'major', suit: null },
    { id: 13, name: 'Death', name_cn: '死神', arcana: 'major', suit: null },
    { id: 14, name: 'Temperance', name_cn: '节制', arcana: 'major', suit: null },
    { id: 15, name: 'The Devil', name_cn: '恶魔', arcana: 'major', suit: null },
    { id: 16, name: 'The Tower', name_cn: '塔', arcana: 'major', suit: null },
    { id: 17, name: 'The Star', name_cn: '星星', arcana: 'major', suit: null },
    { id: 18, name: 'The Moon', name_cn: '月亮', arcana: 'major', suit: null },
    { id: 19, name: 'The Sun', name_cn: '太阳', arcana: 'major', suit: null },
    { id: 20, name: 'Judgement', name_cn: '审判', arcana: 'major', suit: null },
    { id: 21, name: 'The World', name_cn: '世界', arcana: 'major', suit: null },
  ];
  const suits = [
    { suit: 'wands', name_cn: '权杖', names: ['Ace', '二', '三', '四', '五', '六', '七', '八', '九', '十', '侍者', '骑士', '皇后', '国王'], startId: 22 },
    { suit: 'cups', name_cn: '圣杯', names: ['Ace', '二', '三', '四', '五', '六', '七', '八', '九', '十', '侍者', '骑士', '皇后', '国王'], startId: 36 },
    { suit: 'swords', name_cn: '宝剑', names: ['Ace', '二', '三', '四', '五', '六', '七', '八', '九', '十', '侍者', '骑士', '皇后', '国王'], startId: 50 },
    { suit: 'pentacles', name_cn: '星币', names: ['Ace', '二', '三', '四', '五', '六', '七', '八', '九', '十', '侍者', '骑士', '皇后', '国王'], startId: 64 },
  ];
  for (const m of majorArcana) cards.push(m);
  for (const s of suits) {
    for (let i = 0; i < s.names.length; i++) {
      cards.push({ id: s.startId + i, name: `${s.names[i]}`, name_cn: `${s.name_cn}${s.names[i]}`, arcana: 'minor', suit: s.suit });
    }
  }
  return cards;
}

module.exports = {
  initDatabase,
  getAllCards,
  ...compat
};
