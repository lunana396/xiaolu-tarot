/**
 * 数据库模型 - sql.js 实现
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

let db = null;
const DB_PATH = path.join(__dirname, '..', 'data', 'tarot.db');

// 初始化数据库
async function initDatabase() {
  const SQL = await initSqlJs();
  
  // 尝试加载已有数据库
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  // 创建表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      phone TEXT UNIQUE,
      openid TEXT UNIQUE,
      nickname TEXT,
      avatar TEXT,
      points INTEGER DEFAULT 50,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS checkins (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      checkin_date TEXT NOT NULL,
      points_earned INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, checkin_date)
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS point_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      reason TEXT,
      reference_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS readings (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      session_id TEXT,
      question_type TEXT NOT NULL,
      spread_id TEXT NOT NULL,
      cards TEXT NOT NULL,
      positions TEXT NOT NULL,
      interpretation TEXT,
      is_cached INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS shares (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      reading_id TEXT NOT NULL,
      platform TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, reading_id)
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      package_id TEXT NOT NULL,
      package_name TEXT NOT NULL,
      points INTEGER NOT NULL,
      price REAL NOT NULL,
      wechat_order_id TEXT,
      qrcode_url TEXT,
      status TEXT DEFAULT 'pending',
      paid_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      expired_at TEXT
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  
  // 初始化默认配置
  const defaultConfigs = [
    ['ai_model', 'openrouter/qwen/qwen3-4b:free'],
    ['ai_api_key', ''],
    ['wechat_appid', ''],
    ['wechat_mchid', ''],
    ['wechat_apikey', ''],
    ['points_ratio', '1'],
    ['package_basic', JSON.stringify({price: 1, points: 1})],
    ['package_small', JSON.stringify({price: 10, points: 30})],
    ['package_medium', JSON.stringify({price: 20, points: 70})],
    ['package_large', JSON.stringify({price: 30, points: 100})],
    ['package_xlarge', JSON.stringify({price: 50, points: 200})]
  ];
  
  const stmt = db.prepare('INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)');
  defaultConfigs.forEach(([key, value]) => {
    stmt.run([key, value]);
  });
  stmt.free();
  
  saveDatabase();
  console.log('数据库初始化完成');
}

// 保存数据库到文件
function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, buffer);
}

// ============ 用户操作 ============

function createUser(id, phone, openid) {
  const stmt = db.prepare('SELECT * FROM users WHERE phone = ? OR openid = ?');
  stmt.bind([phone || '', openid || '']);
  if (stmt.step()) {
    const user = stmt.getAsObject();
    stmt.free();
    return user;
  }
  stmt.free();
  
  db.run('INSERT INTO users (id, phone, openid, points) VALUES (?, ?, ?, ?)', 
    [id, phone || null, openid || null, 50]);
  saveDatabase();
  
  // 记录积分流水
  addTransaction(id, 'earn', 50, '新用户注册奖励');
  
  return getUserById(id);
}

function getUserById(id) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  stmt.bind([id]);
  let user = null;
  if (stmt.step()) {
    user = stmt.getAsObject();
  }
  stmt.free();
  return user;
}

function getUserByPhone(phone) {
  const stmt = db.prepare('SELECT * FROM users WHERE phone = ?');
  stmt.bind([phone]);
  let user = null;
  if (stmt.step()) {
    user = stmt.getAsObject();
  }
  stmt.free();
  return user;
}

function getUserByUsername(username) {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  stmt.bind([username]);
  let user = null;
  if (stmt.step()) {
    user = stmt.getAsObject();
  }
  stmt.free();
  return user;
}

function createUserWithPassword(id, username, password) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users (id, username, password, points) VALUES (?, ?, ?, ?)', 
    [id, username, hashedPassword, 50]);
  saveDatabase();
  return getUserById(id);
}

function updateUserPoints(userId, amount) {
  db.run('UPDATE users SET points = points + ?, updated_at = datetime("now") WHERE id = ?', [amount, userId]);
  saveDatabase();
}

// ============ 签到操作 ============

function checkin(userId) {
  const today = new Date().toISOString().split('T')[0];
  
  const stmt = db.prepare('SELECT * FROM checkins WHERE user_id = ? AND checkin_date = ?');
  stmt.bind([userId, today]);
  if (stmt.step()) {
    stmt.free();
    return { error: '今天已签到' };
  }
  stmt.free();
  
  // 计算连续签到天数
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const checkStmt = db.prepare('SELECT * FROM checkins WHERE user_id = ? ORDER BY checkin_date DESC');
  checkStmt.bind([userId]);
  
  let consecutive = 0;
  let expected = new Date();
  while (checkStmt.step()) {
    const row = checkStmt.getAsObject();
    const expectedStr = expected.toISOString().split('T')[0];
    if (row.checkin_date === expectedStr) {
      consecutive++;
      expected.setDate(expected.getDate() - 1);
    } else if (row.checkin_date === today) {
      consecutive = 1;
      expected = new Date(Date.now() - 86400000);
    } else {
      break;
    }
  }
  checkStmt.free();
  
  // 确定签到奖励
  let basePoints = 1;
  if (consecutive >= 30) basePoints = 5;
  else if (consecutive >= 7) basePoints = 4;
  else if (consecutive >= 3) basePoints = 3;
  
  // 记录签到
  const { v4: uuidv4 } = require('uuid');
  db.run('INSERT INTO checkins (id, user_id, checkin_date, points_earned) VALUES (?, ?, ?, ?)',
    [uuidv4(), userId, today, basePoints]);
  
  // 更新积分
  updateUserPoints(userId, basePoints);
  
  // 记录流水
  addTransaction(userId, 'earn', basePoints, `每日签到奖励（第${consecutive + 1}天）`);
  
  saveDatabase();
  
  return {
    points_earned: basePoints,
    consecutive_days: consecutive + 1
  };
}

function getCheckins(userId, limit = 30) {
  const results = [];
  const stmt = db.prepare('SELECT * FROM checkins WHERE user_id = ? ORDER BY checkin_date DESC LIMIT ?');
  stmt.bind([userId, limit]);
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// ============ 积分流水 ============

function addTransaction(userId, type, amount, reason, referenceId) {
  const { v4: uuidv4 } = require('uuid');
  db.run('INSERT INTO point_transactions (id, user_id, type, amount, reason, reference_id) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), userId, type, amount, reason || '', referenceId || null]);
  saveDatabase();
}

function getTransactions(userId, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const results = [];
  
  const stmt = db.prepare('SELECT * FROM point_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?');
  stmt.bind([userId, limit, offset]);
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM point_transactions WHERE user_id = ?');
  countStmt.bind([userId]);
  countStmt.step();
  const total = countStmt.getAsObject().count;
  countStmt.free();
  
  return { transactions: results, total };
}

// ============ 解读记录 ============

function saveReading(reading) {
  db.run(`INSERT INTO readings (id, user_id, session_id, question_type, spread_id, cards, positions, interpretation, is_cached)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [reading.id, reading.user_id, reading.session_id, reading.question_type, reading.spread_id,
     JSON.stringify(reading.cards), JSON.stringify(reading.positions),
     JSON.stringify(reading.interpretation), reading.is_cached ? 1 : 0]);
  saveDatabase();
}

function getReadings(userId, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const results = [];
  const stmt = db.prepare('SELECT * FROM readings WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?');
  stmt.bind([userId, limit, offset]);
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      ...row,
      cards: JSON.parse(row.cards),
      positions: JSON.parse(row.positions),
      interpretation: row.interpretation ? JSON.parse(row.interpretation) : null
    });
  }
  stmt.free();
  
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM readings WHERE user_id = ?');
  countStmt.bind([userId]);
  countStmt.step();
  const total = countStmt.getAsObject().count;
  countStmt.free();
  
  return { readings: results, total };
}

function getReadingById(id) {
  const stmt = db.prepare('SELECT * FROM readings WHERE id = ?');
  stmt.bind([id]);
  let reading = null;
  if (stmt.step()) {
    const row = stmt.getAsObject();
    reading = {
      ...row,
      cards: JSON.parse(row.cards),
      positions: JSON.parse(row.positions),
      interpretation: row.interpretation ? JSON.parse(row.interpretation) : null
    };
  }
  stmt.free();
  return reading;
}

// ============ 分享记录 ============

function saveShare(shareId, userId, readingId, platform) {
  db.run('INSERT INTO shares (id, user_id, reading_id, platform) VALUES (?, ?, ?, ?)',
    [shareId, userId, readingId, platform || 'unknown']);
  saveDatabase();
}

function getShare(userId, readingId) {
  const stmt = db.prepare('SELECT * FROM shares WHERE user_id = ? AND reading_id = ?');
  stmt.bind([userId, readingId]);
  let share = null;
  if (stmt.step()) {
    share = stmt.getAsObject();
  }
  stmt.free();
  return share;
}

// ============ 订单操作 ============

function createOrder(order) {
  db.run(`INSERT INTO orders (id, user_id, package_id, package_name, points, price, wechat_order_id, qrcode_url, status, expired_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [order.id, order.user_id, order.package_id, order.package_name, order.points, order.price,
     order.wechat_order_id || null, order.qrcode_url || null, order.expired_at]);
  saveDatabase();
}

function getOrder(orderId) {
  const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
  stmt.bind([orderId]);
  let order = null;
  if (stmt.step()) {
    order = stmt.getAsObject();
  }
  stmt.free();
  return order;
}

function updateOrderStatus(orderId, status) {
  if (status === 'paid') {
    db.run('UPDATE orders SET status = ?, paid_at = datetime("now") WHERE id = ?', [status, orderId]);
  } else {
    db.run('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  }
  saveDatabase();
}

function updateOrderQRCode(orderId, qrcodeUrl) {
  db.run('UPDATE orders SET qrcode_url = ? WHERE id = ?', [qrcodeUrl, orderId]);
  saveDatabase();
}

// ============ 配置操作 ============

function getConfig(key) {
  const stmt = db.prepare('SELECT value FROM config WHERE key = ?');
  stmt.bind([key]);
  let value = null;
  if (stmt.step()) {
    value = stmt.getAsObject().value;
    try {
      value = JSON.parse(value);
    } catch (e) {}
  }
  stmt.free();
  return value;
}

function getAllConfig() {
  const results = {};
  const stmt = db.prepare('SELECT * FROM config');
  while (stmt.step()) {
    const row = stmt.getAsObject();
    try {
      results[row.key] = JSON.parse(row.value);
    } catch (e) {
      results[row.key] = row.value;
    }
  }
  stmt.free();
  return results;
}

function setConfig(key, value) {
  const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
  db.run('INSERT OR REPLACE INTO config (key, value, updated_at) VALUES (?, ?, datetime("now"))', [key, strValue]);
  saveDatabase();
}

// ============ 管理后台 ============

function getAllUsers(page = 1, limit = 20, search = '') {
  const offset = (page - 1) * limit;
  const results = [];
  
  let query = 'SELECT id, phone, nickname, avatar, points, created_at FROM users';
  let countQuery = 'SELECT COUNT(*) as count FROM users';
  let params = [];
  
  if (search) {
    query += ' WHERE phone LIKE ? OR nickname LIKE ?';
    countQuery += ' WHERE phone LIKE ? OR nickname LIKE ?';
    params = [`%${search}%`, `%${search}%`];
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const stmt = db.prepare(query);
  stmt.bind(params);
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  
  const countStmt = db.prepare(countQuery);
  if (search) countStmt.bind([`%${search}%`, `%${search}%`]);
  else countStmt.bind([]);
  countStmt.step();
  const total = countStmt.getAsObject().count;
  countStmt.free();
  
  return { users: results, total };
}

function getUserDetail(userId) {
  const user = getUserById(userId);
  if (!user) return null;
  
  return {
    ...user,
    checkins: getCheckins(userId),
    transactions: getTransactions(userId, 1, 50).transactions,
    readings: getReadings(userId, 1, 20).readings
  };
}

function getStats() {
  const stats = {};
  
  const usersStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  usersStmt.step();
  stats.total_users = usersStmt.getAsObject().count;
  usersStmt.free();
  
  const readingsStmt = db.prepare('SELECT COUNT(*) as count FROM readings');
  readingsStmt.step();
  stats.total_readings = readingsStmt.getAsObject().count;
  readingsStmt.free();
  
  const pointsStmt = db.prepare('SELECT SUM(points) as sum FROM users');
  pointsStmt.step();
  stats.total_points = pointsStmt.getAsObject().sum || 0;
  pointsStmt.free();
  
  const today = new Date().toISOString().split('T')[0];
  const checkinsStmt = db.prepare('SELECT COUNT(*) as count FROM checkins WHERE checkin_date = ?');
  checkinsStmt.bind([today]);
  checkinsStmt.step();
  stats.today_checkins = checkinsStmt.getAsObject().count;
  checkinsStmt.free();
  
  const todayReadingsStmt = db.prepare("SELECT COUNT(*) as count FROM readings WHERE date(created_at) = ?");
  todayReadingsStmt.bind([today]);
  todayReadingsStmt.step();
  stats.today_readings = todayReadingsStmt.getAsObject().count;
  todayReadingsStmt.free();
  
  const cacheStmt = db.prepare('SELECT SUM(is_cached) as hits, COUNT(*) as total FROM readings');
  cacheStmt.step();
  const cacheData = cacheStmt.getAsObject();
  stats.cache_hit_rate = cacheData.total > 0 ? ((cacheData.hits / cacheData.total) * 100).toFixed(1) + '%' : '0%';
  cacheStmt.free();
  
  return stats;
}

module.exports = {
  initDatabase,
  saveDatabase,
  
  // 用户
  createUser,
  createUserWithPassword,
  getUserById,
  getUserByPhone,
  getUserByUsername,
  updateUserPoints,
  
  // 签到
  checkin,
  getCheckins,
  
  // 积分流水
  addTransaction,
  getTransactions,
  
  // 解读
  saveReading,
  getReadings,
  getReadingById,
  
  // 分享
  saveShare,
  getShare,
  
  // 订单
  createOrder,
  getOrder,
  updateOrderStatus,
  updateOrderQRCode,
  
  // 配置
  getConfig,
  getAllConfig,
  setConfig,
  
  // 管理
  getAllUsers,
  getUserDetail,
  getStats
};
