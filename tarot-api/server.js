/**
 * 小鹿塔罗占卜 - API Server
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3005;
const JWT_SECRET = process.env.JWT_SECRET || 'tarot-secret-key-change-in-production';
const POINTS_PER_READING = 5;
const NEW_USER_POINTS = 50;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件
app.use(express.static(path.join(__dirname, '..', 'tarot-h5')));
app.use('/admin', express.static(path.join(__dirname, '..', 'tarot-admin')));
app.use('/assets', express.static(path.join(__dirname, '..', 'tarot-assets')));

// 引入模块
const db = require('./models/database');
const aiService = require('./services/ai');
const tarotDb = require('../tarot-data/tarot_db');
const cardSpreads = require('../tarot-data/card_spreads');
const tarotImages = require('../tarot-data/tarot_images');

// ============ 中间件 ============

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: '需要登录' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'token无效' });
  }
}

function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (e) {}
  }
  next();
}

function adminAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: '需要登录' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: '权限不足' });
    }
    req.admin = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'token无效' });
  }
}

// ============ 塔罗牌数据接口 ============

// 检查本地图片是否存在
function getLocalCardImage(cardId) {
  const fs = require('fs');
  const path = require('path');
  const localPath = path.join(__dirname, '..', 'tarot-assets', 'cards', `card_${String(cardId).padStart(2, '0')}.jpg`);
  if (fs.existsSync(localPath)) {
    return `/assets/cards/card_${String(cardId).padStart(2, '0')}.jpg`;
  }
  return null;
}

app.get('/api/cards', (req, res) => {
  const cards = tarotDb.getAllCards();
  const images = tarotImages.getAllCardImages();
  
  // 添加图片URL到每张牌（优先使用本地图片）
  const cardsWithImages = cards.map(card => {
    const localImg = getLocalCardImage(card.id);
    return {
      ...card,
      img: localImg || images[card.id]?.img || null,
      img_reversed: localImg || images[card.id]?.img || null
    };
  });
  
  res.json({ 
    success: true, 
    data: cardsWithImages,
    card_back: tarotImages.cardBackImage
  });
});

app.get('/api/spreads', (req, res) => {
  const category = req.query.category;
  let spreads = Object.values(cardSpreads.cardSpreads);
  if (category) {
    spreads = spreads.filter(s => s.category === category);
  }
  res.json({ success: true, data: spreads });
});

app.get('/api/question-types', (req, res) => {
  res.json({ success: true, data: cardSpreads.getAllQuestionTypes() });
});

// ============ 认证接口 ============

// 用户注册
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  
  if (username.length < 3) {
    return res.status(400).json({ error: '用户名至少3个字符' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少6个字符' });
  }

  // 检查用户名是否已存在
  const existingUser = db.getUserByUsername(username);
  if (existingUser) {
    return res.status(400).json({ error: '用户名已存在' });
  }

  // 创建用户（用户名+密码）
  const userId = uuidv4();
  const user = db.createUserWithPassword(userId, username, password);
  
  // 记录积分流水
  db.addTransaction(userId, 'earn', NEW_USER_POINTS, '新用户注册奖励');

  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        points: user.points
      }
    }
  });
});

// 用户登录
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  // 查找用户
  const user = db.getUserByUsername(username);

  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  // 验证密码
  if (!bcrypt.compareSync(password, user.password || '')) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        points: user.points
      }
    }
  });
});

// ============ 用户接口 ============

app.get('/api/user/profile', authMiddleware, (req, res) => {
  const user = db.getUserById(req.user.userId);
  if (!user) return res.status(404).json({ error: '用户不存在' });

  const checkins = db.getCheckins(req.user.userId);
  const today = new Date().toISOString().split('T')[0];
  
  // 计算连续签到天数
  let consecutiveDays = 0;
  let expected = new Date();
  for (const c of checkins) {
    const expectedStr = expected.toISOString().split('T')[0];
    if (c.checkin_date === expectedStr) {
      consecutiveDays++;
      expected.setDate(expected.getDate() - 1);
    } else break;
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      points: user.points,
      consecutive_days: consecutiveDays,
      is_today_checkin: checkins.some(c => c.checkin_date === today),
      created_at: user.created_at
    }
  });
});

// ============ 积分接口 ============

app.post('/api/points/checkin', authMiddleware, (req, res) => {
  const result = db.checkin(req.user.userId);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  
  const user = db.getUserById(req.user.userId);
  res.json({
    success: true,
    data: {
      points_earned: result.points_earned,
      total_points: user.points,
      consecutive_days: result.consecutive_days
    }
  });
});

app.get('/api/points/history', authMiddleware, (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const data = db.getTransactions(req.user.userId, parseInt(page), parseInt(limit));
  res.json({
    success: true,
    data: {
      ...data,
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

// ============ 占卜接口 ============

app.post('/api/reading/start', optionalAuth, (req, res) => {
  const { question_type } = req.body;
  const questionConfig = cardSpreads.getQuestionType(question_type);
  
  if (!questionConfig) {
    return res.status(400).json({ error: '无效的问题类型' });
  }

  const sessionId = uuidv4();
  const cards = tarotDb.shuffleCards(questionConfig.spread.cardCount);

  res.json({
    success: true,
    data: {
      session_id: sessionId,
      question_type,
      spread_id: questionConfig.spread.id,
      cards: cards.map(c => ({
        id: c.id,
        name: c.name,
        name_cn: c.name_cn,
        emoji: c.emoji
      })),
      positions: questionConfig.spread.positions,
      needs_points: true
    }
  });
});

app.post('/api/reading/draw', (req, res) => {
  const { selected_indices } = req.body;
  
  const cards = tarotDb.shuffleCards(78);
  const drawnCards = selected_indices.map((idx, i) => {
    const card = cards[idx];
    const isReversed = Math.random() < 0.25;
    return {
      ...card,
      position: i,
      is_reversed: isReversed
    };
  });

  res.json({
    success: true,
    data: { drawn_cards: drawnCards }
  });
});

app.post('/api/reading/interpret', authMiddleware, async (req, res) => {
  const { session_id, drawn_cards, question_type, spread_id } = req.body;
  const userId = req.user.userId;

  // 检查积分
  const user = db.getUserById(userId);
  if (user.points < POINTS_PER_READING) {
    return res.status(400).json({ 
      error: '积分不足',
      code: 'INSUFFICIENT_POINTS',
      need_points: POINTS_PER_READING,
      current_points: user.points
    });
  }

  // 生成解读
  const { interpretation, is_cached } = await aiService.generateInterpretation(
    question_type,
    spread_id,
    drawn_cards
  );

  // 扣积分
  db.updateUserPoints(userId, -POINTS_PER_READING);
  db.addTransaction(userId, 'spend', -POINTS_PER_READING, '占卜消耗', session_id);

  // 保存解读
  const readingId = uuidv4();
  db.saveReading({
    id: readingId,
    user_id: userId,
    session_id,
    question_type,
    spread_id,
    cards: drawn_cards.map(c => ({ id: c.id, is_reversed: c.is_reversed })),
    positions: drawn_cards.map((c, i) => ({ position: i, name: c.name_cn })),
    interpretation,
    is_cached
  });

  res.json({
    success: true,
    data: {
      reading_id: readingId,
      interpretation,
      is_cached,
      points_spent: POINTS_PER_READING,
      remaining_points: user.points - POINTS_PER_READING
    }
  });
});

app.get('/api/reading/history', authMiddleware, (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const data = db.getReadings(req.user.userId, parseInt(page), parseInt(limit));
  res.json({ success: true, data });
});

// ============ 分享接口 ============

app.post('/api/share', authMiddleware, (req, res) => {
  const { reading_id } = req.body;

  const reading = db.getReadingById(reading_id);
  if (!reading) {
    return res.status(404).json({ error: '解读不存在' });
  }

  const existingShare = db.getShare(req.user.userId, reading_id);
  if (existingShare) {
    return res.json({
      success: true,
      data: { already_shared: true, share_id: existingShare.id }
    });
  }

  const shareId = uuidv4();
  db.saveShare(shareId, req.user.userId, reading_id, 'unknown');

  const shareReward = 3;
  db.updateUserPoints(req.user.userId, shareReward);
  db.addTransaction(req.user.userId, 'earn', shareReward, '分享奖励', shareId);

  const user = db.getUserById(req.user.userId);

  res.json({
    success: true,
    data: {
      share_id: shareId,
      points_earned: shareReward,
      total_points: user.points,
      share_text: generateShareText(reading)
    }
  });
});

function generateShareText(reading) {
  const questionLabels = {
    today: '今日运势', tomorrow: '明日运势',
    thisWeek: '本周运势', nextWeek: '下周运势',
    thisMonth: '本月运势', nextMonth: '下月运势',
    currentSituation: '现状解读', relationship: '情感解读',
    career: '事业解读', choice: '抉择分析', spiritual: '灵性指引'
  };
  
  return `🔮 我的${questionLabels[reading.question_type] || '塔罗'}解读

我在小鹿塔罗占卜抽到了神秘的塔罗牌阵✨
点击查看我的专属解读👇

#小鹿塔罗 #塔罗占卜`;
}

// ============ 支付接口 ============

const PACKAGES = {
  basic: { id: 'basic', name: '基础包', price: 1, points: 1 },
  small: { id: 'small', name: '小包', price: 10, points: 30 },
  medium: { id: 'medium', name: '中包', price: 20, points: 70 },
  large: { id: 'large', name: '大包', price: 30, points: 100 },
  xlarge: { id: 'xlarge', name: '超大包', price: 50, points: 200 }
};

app.get('/api/packages', (req, res) => {
  res.json({ success: true, data: Object.values(PACKAGES) });
});

app.post('/api/pay/create-order', authMiddleware, async (req, res) => {
  const { package_id } = req.body;
  const pkg = PACKAGES[package_id];
  if (!pkg) {
    return res.status(400).json({ error: '无效的套餐' });
  }

  const orderId = uuidv4();
  const expiredAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  db.createOrder({
    id: orderId,
    user_id: req.user.userId,
    package_id: pkg.id,
    package_name: pkg.name,
    points: pkg.points,
    price: pkg.price,
    expired_at: expiredAt
  });

  // 生成支付二维码
  const wechatConfig = {
    appid: db.getConfig('wechat_appid'),
    mchid: db.getConfig('wechat_mchid')
  };

  try {
    let qrcodeUrl;
    
    if (wechatConfig.appid && wechatConfig.mchid) {
      // 真实微信支付
      qrcodeUrl = await createWechatPay(orderId, pkg.price, wechatConfig);
    } else {
      // 模拟支付
      qrcodeUrl = `http://localhost:${PORT}/api/pay/mock-qr/${orderId}`;
    }
    
    db.updateOrderQRCode(orderId, qrcodeUrl);

    res.json({
      success: true,
      data: {
        order_id: orderId,
        qrcode_url: qrcodeUrl,
        expired_at: expiredAt
      }
    });
  } catch (e) {
    console.error('创建支付失败:', e);
    const mockQR = `http://localhost:${PORT}/api/pay/mock-qr/${orderId}`;
    res.json({
      success: true,
      data: {
        order_id: orderId,
        qrcode_url: mockQR,
        mock: true,
        expired_at: expiredAt
      }
    });
  }
});

async function createWechatPay(orderId, totalFee, config) {
  // 真实微信支付需要调用微信API
  // 这里返回简化版，实际需要调用微信统一下单API
  const payInfo = `weixin://wxpay/bizpayurl?pr=tarot_${orderId}`;
  return payInfo;
}

app.get('/api/pay/order/:orderId', authMiddleware, (req, res) => {
  const order = db.getOrder(req.params.orderId);
  if (!order || order.user_id !== req.user.userId) {
    return res.status(404).json({ error: '订单不存在' });
  }
  res.json({ success: true, data: order });
});

app.get('/api/pay/mock-qr/:orderId', async (req, res) => {
  const order = db.getOrder(req.params.orderId);
  if (!order) return res.status(404).send('Order not found');

  const qrDataUrl = await QRCode.toDataURL(`http://localhost:${PORT}/api/pay/mock/${order.id}`);

  res.type('html').send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>模拟微信支付</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
        .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); text-align: center; max-width: 320px; }
        h2 { color: #07c160; margin-bottom: 20px; }
        .qr { background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .qr img { width: 200px; height: 200px; }
        .amount { font-size: 28px; font-weight: bold; color: #333; }
        .points { color: #666; font-size: 14px; margin: 10px 0; }
        button { background: #07c160; color: white; border: none; padding: 12px 32px; border-radius: 6px; font-size: 16px; cursor: pointer; margin-top: 20px; }
        button:hover { background: #06ad56; }
        .mock { color: #ff9800; font-size: 12px; margin-top: 15px; }
        .status { margin-top: 15px; padding: 10px; border-radius: 6px; display: none; }
        .status.success { background: #e8f5e9; color: #2e7d32; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>微信扫码支付</h2>
        <div class="qr">
          <img src="${qrDataUrl}" alt="支付二维码">
        </div>
        <div class="amount">¥${order.price}</div>
        <div class="points">获得 ${order.points} 积分</div>
        <div id="status" class="status"></div>
        <button onclick="mockPay()">模拟支付成功</button>
        <div class="mock">⚠️ 开发环境 - 点击按钮模拟支付</div>
      </div>
      <script>
        async function mockPay() {
          const btn = document.querySelector('button');
          btn.disabled = true;
          btn.textContent = '处理中...';
          
          await fetch('/api/pay/mock-callback/${order.id}', { method: 'POST' });
          
          document.getElementById('status').textContent = '支付成功！';
          document.getElementById('status').className = 'status success';
          document.getElementById('status').style.display = 'block';
          btn.textContent = '已支付';
        }
        
        // 轮询订单状态
        async function checkStatus() {
          const res = await fetch('/api/pay/order/${order.id}');
          const data = await res.json();
          if (data.data.status === 'paid') {
            document.getElementById('status').textContent = '支付成功！';
            document.getElementById('status').className = 'status success';
            document.getElementById('status').style.display = 'block';
          }
        }
        setInterval(checkStatus, 2000);
      </script>
    </body>
    </html>
  `);
});

app.post('/api/pay/mock-callback/:orderId', (req, res) => {
  const order = db.getOrder(req.params.orderId);
  if (!order || order.status !== 'pending') {
    return res.status(404).json({ error: '订单不存在或已处理' });
  }

  // 检查是否过期
  if (new Date(order.expired_at) < new Date()) {
    db.updateOrderStatus(order.id, 'expired');
    return res.status(400).json({ error: '订单已过期' });
  }

  // 更新订单
  db.updateOrderStatus(order.id, 'paid');

  // 增加积分
  db.updateUserPoints(order.user_id, order.points);
  db.addTransaction(order.user_id, 'earn', order.points, `购买积分（${order.package_name}）`, order.id);

  res.json({ success: true });
});

// ============ 管理后台 ============

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, data: { token } });
  }
  
  res.status(401).json({ error: '账号或密码错误' });
});

app.get('/api/admin/config', adminAuth, (req, res) => {
  res.json({ success: true, data: db.getAllConfig() });
});

app.post('/api/admin/config', adminAuth, (req, res) => {
  const { key, value } = req.body;
  db.setConfig(key, value);
  res.json({ success: true });
});

app.get('/api/admin/stats', adminAuth, (req, res) => {
  res.json({ success: true, data: db.getStats() });
});

app.get('/api/admin/users', adminAuth, (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const data = db.getAllUsers(parseInt(page), parseInt(limit), search);
  res.json({ success: true, data });
});

app.get('/api/admin/users/:userId', adminAuth, (req, res) => {
  const user = db.getUserDetail(req.params.userId);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json({ success: true, data: user });
});

app.post('/api/admin/users/:userId/points', adminAuth, (req, res) => {
  const { amount, reason } = req.body;
  const user = db.getUserById(req.params.userId);
  if (!user) return res.status(404).json({ error: '用户不存在' });

  const newPoints = user.points + parseInt(amount);
  if (newPoints < 0) return res.status(400).json({ error: '积分不能为负' });

  db.updateUserPoints(user.id, parseInt(amount));
  db.addTransaction(user.id, amount > 0 ? 'earn' : 'spend', parseInt(amount), reason || '管理员调整');

  res.json({ success: true, data: { new_points: newPoints } });
});

// ============ 启动 ============

async function start() {
  await db.initDatabase();
  
  app.listen(PORT, () => {
    console.log(`🔮 小鹿塔罗 API 服务已启动: http://localhost:${PORT}`);
    console.log(`📱 用户端 H5: tarot-h5/index.html`);
    console.log(`⚙️  管理后台: tarot-admin/index.html`);
    console.log(`🔑 管理账号: admin / admin123`);
  });
}

start().catch(console.error);
