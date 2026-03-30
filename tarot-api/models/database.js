/**
 * Turso Database - 替换 sql.js 为 @libsql/client
 * 支持 Vercel Serverless 环境
 */
const { createClient } = require('@libsql/client');

let db = null;

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
  // 用户表
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
  
  // 占卜记录表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS divinations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      username TEXT,
      question_type TEXT NOT NULL,
      spread_id TEXT NOT NULL,
      drawn_cards TEXT,
      interpretation TEXT,
      interpretation_cache TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  // 签到记录表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS checkin_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  // 配置表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  
  // 创建测试用户
  const testUser = await db.execute(
    "SELECT id FROM users WHERE username = 'xiaolu'"
  );
  if (testUser.rows.length === 0) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('123456', 10);
    const userId = generateId();
    await db.execute({
      sql: "INSERT INTO users (id, username, password, points, is_admin) VALUES (?, ?, ?, 50, 0)",
      args: [userId, 'xiaolu', hashedPassword]
    });
  }
  
  // 创建管理员
  const adminUser = await db.execute(
    "SELECT id FROM users WHERE username = 'admin'"
  );
  if (adminUser.rows.length === 0) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const userId = generateId();
    await db.execute({
      sql: "INSERT INTO users (id, username, password, points, is_admin) VALUES (?, ?, ?, 100, 1)",
      args: [userId, 'admin', hashedPassword]
    });
  }
}

// 获取所有卡牌
function getAllCards() {
  const cards = [];
  
  // 大阿尔卡纳 0-21
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
  
  // 小阿尔卡纳 22-77
  const suits = [
    { suit: 'wands', name_cn: '权杖', names: ['Ace', '二', '三', '四', '五', '六', '七', '八', '九', '十', '侍者', '骑士', '皇后', '国王'], startId: 22 },
    { suit: 'cups', name_cn: '圣杯', names: ['Ace', '二', '三', '四', '五', '六', '七', '八', '九', '十', '侍者', '骑士', '皇后', '国王'], startId: 36 },
    { suit: 'swords', name_cn: '宝剑', names: ['Ace', '二', '三', '四', '五', '六', '七', '八', '九', '十', '侍者', '骑士', '皇后', '国王'], startId: 50 },
    { suit: 'pentacles', name_cn: '星币', names: ['Ace', '二', '三', '四', '五', '六', '七', '八', '九', '十', '侍者', '骑士', '皇后', '国王'], startId: 64 },
  ];
  
  for (const m of majorArcana) cards.push(m);
  for (const s of suits) {
    for (let i = 0; i < s.names.length; i++) {
      cards.push({
        id: s.startId + i,
        name: `${s.names[i]}`,
        name_cn: `${s.name_cn}${s.names[i]}`,
        arcana: 'minor',
        suit: s.suit
      });
    }
  }
  
  return cards;
}

// 用户操作
const userDB = {
  async findByUsername(username) {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE username = ?",
      args: [username]
    });
    return result.rows[0] || null;
  },
  
  async findById(id) {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE id = ?",
      args: [id]
    });
    return result.rows[0] || null;
  },
  
  async create(id, username, passwordHash, isAdmin = false) {
    await db.execute({
      sql: "INSERT INTO users (id, username, password, points, is_admin) VALUES (?, ?, ?, 50, ?)",
      args: [id, username, passwordHash, isAdmin ? 1 : 0]
    });
    return this.findById(id);
  },
  
  async updatePoints(id, points) {
    await db.execute({
      sql: "UPDATE users SET points = ? WHERE id = ?",
      args: [points, id]
    });
  },
  
  async checkin(id, consecutiveDays) {
    await db.execute({
      sql: "UPDATE users SET is_today_checkin = 1, last_checkin = datetime('now'), consecutive_days = ? WHERE id = ?",
      args: [consecutiveDays, id]
    });
  }
};

// 占卜记录操作
const divinationDB = {
  async create(id, userId, username, questionType, spreadId, drawnCards) {
    await db.execute({
      sql: "INSERT INTO divinations (id, user_id, username, question_type, spread_id, drawn_cards) VALUES (?, ?, ?, ?, ?, ?)",
      args: [id, userId, username, questionType, spreadId, JSON.stringify(drawnCards)]
    });
  },
  
  async updateInterpretation(id, interpretation) {
    await db.execute({
      sql: "UPDATE divinations SET interpretation_cache = ? WHERE id = ?",
      args: [JSON.stringify(interpretation), id]
    });
  },
  
  async findById(id) {
    const result = await db.execute({
      sql: "SELECT * FROM divinations WHERE id = ?",
      args: [id]
    });
    return result.rows[0] || null;
  },
  
  async findByUserId(userId, limit = 10) {
    const result = await db.execute({
      sql: "SELECT * FROM divinations WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
      args: [userId, limit]
    });
    return result.rows;
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

// 配置操作
const configDB = {
  async get(key) {
    const result = await db.execute({
      sql: "SELECT value FROM config WHERE key = ?",
      args: [key]
    });
    return result.rows[0]?.value || null;
  },
  
  async set(key, value) {
    await db.execute({
      sql: "INSERT OR REPLACE INTO config (key, value, updated_at) VALUES (?, ?, datetime('now'))",
      args: [key, value]
    });
  }
};

// 生成UUID
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

module.exports = {
  initDatabase,
  getAllCards,
  userDB,
  divinationDB,
  configDB,
  generateId
};
