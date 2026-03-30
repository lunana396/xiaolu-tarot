# 小鹿塔罗占卜 - 详细设计方案

## 一、产品概述

| 项目 | 内容 |
|------|------|
| 产品名称 | 小鹿塔罗占卜 |
| 载体 | H5（后续可拓展小程序） |
| 目标用户 | 女性用户为主 |
| 核心目标 | 前期免费吸引粉丝，后期商业化变现 |
| 核心钩子 | AI 塔罗解读（瑞秋·波拉克风格）+ 社交裂变 |

---

## 二、技术架构

### 2.1 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户端 H5                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ 首页    │→ │ 引导页  │→ │ 洗牌页  │→ │ 选牌页  │         │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │
│       ↓                                              ↓       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ 个人中心 │← │ 解读页  │← │ 翻牌页  │← │ 解读页  │         │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      后端 API 服务                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 用户模块  │  │ 积分模块  │  │ 占卜模块  │  │ 支付模块  │   │
│  │ 登录     │  │ 签到     │  │ 洗牌     │  │ 微信支付  │   │
│  │ 注册     │  │ 消耗     │  │ 选牌     │  │ 订单查询  │   │
│  │ 个人信息 │  │ 流水     │  │ 解读     │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                           │                                  │
│                    ┌──────┴──────┐                           │
│                    │  SQLite DB  │                           │
│                    └─────────────┘                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      OpenRouter API                         │
│              AI 解读（瑞秋·波拉克人设）                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      管理后台 H5                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ 数据统计  │  │ 用户管理  │  │ 系统配置  │                  │
│  │ 总用户   │  │ 用户列表  │  │ AI模型   │                  │
│  │ 总占卜   │  │ 积分调整  │  │ 支付配置  │                  │
│  │ 今日数据  │  │ 详情查看  │  │ 套餐配置  │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 技术栈

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 前端用户端 | HTML5 + CSS3 + Vanilla JS | 单文件，响应式设计 |
| 前端管理端 | HTML5 + CSS3 + Vanilla JS | 单文件，分离部署 |
| 后端 | Node.js + Express | 轻量级服务器 |
| 数据库 | SQLite (better-sqlite3) | Phase 1 轻量够用 |
| AI | OpenRouter API | 支持免费模型 |
| 支付 | 微信 Native支付 | 二维码扫码 |
| 缓存 | node-cache | 内存缓存 |

### 2.3 项目结构

```
xiaolu-tarot/
├── tarot-h5/
│   └── index.html           # 用户端H5（完整单页应用）
├── tarot-api/
│   ├── server.js            # 主服务入口
│   ├── helpers.js           # 辅助函数
│   ├── routes/
│   │   ├── auth.js          # 认证路由
│   │   ├── user.js          # 用户路由
│   │   ├── points.js        # 积分路由
│   │   ├── reading.js       # 占卜路由
│   │   ├── share.js         # 分享路由
│   │   ├── pay.js           # 支付路由
│   │   └── admin.js         # 管理后台路由
│   ├── models/
│   │   └── database.js      # 数据库模型
│   ├── services/
│   │   ├── ai.js            # AI解读服务
│   │   ├── cache.js         # 缓存服务
│   │   └── wechat.js        # 微信支付服务
│   └── data/
│       └── tarot.db         # SQLite数据库
├── tarot-admin/
│   └── index.html           # 管理后台（完整单页应用）
├── tarot-data/
│   ├── tarot_db.js          # 78张塔罗牌数据
│   └── card_spreads.js      # 牌阵配置
├── tarot-assets/
│   ├── cards/               # 塔罗牌正面图片
│   ├── covers/              # 塔罗牌背面图片
│   └── music/               # 背景音乐
└── README.md
```

---

## 三、数据库设计

### 3.1 ER图

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   users     │     │  readings   │     │   orders    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │────<│ user_id(FK) │     │ id (PK)     │
│ phone       │     │ id (PK)     │     │ user_id(FK) │
│ openid      │     │ question_   │     │ package_id  │
│ nickname    │     │   type      │     │ points      │
│ avatar      │     │ spread_id   │     │ price       │
│ points      │     │ cards       │     │ status      │
│ created_at  │     │ interpretation│   │ wechat_     │
└─────────────┘     │ created_at  │     │   order_id  │
      │             └─────────────┘     │ created_at  │
      │                   │             └─────────────┘
      │                   │                     │
      ↓                   ↓                     ↓
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ checkins    │     │   shares    │     │    config   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │     │ id (PK)     │     │ key (PK)    │
│ user_id(FK) │     │ user_id(FK) │     │ value       │
│ checkin_date│     │ reading_id  │     │ updated_at  │
│ points_     │     │   (FK)      │     └─────────────┘
│   earned    │     │ platform     │
│ created_at  │     │ created_at   │
└─────────────┘     └─────────────┘
      │
      ↓
┌─────────────────────┐
│ point_transactions  │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ type (earn/spend)   │
│ amount              │
│ reason              │
│ reference_id        │
│ created_at          │
└─────────────────────┘
```

### 3.2 表结构详解

#### users 用户表
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE,
  openid TEXT UNIQUE,
  nickname TEXT,
  avatar TEXT,
  points INTEGER DEFAULT 50,     -- 初始50积分
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### checkins 签到记录表
```sql
CREATE TABLE checkins (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  checkin_date DATE NOT NULL,
  points_earned INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, checkin_date)  -- 每天只能签到一次
);
```

#### point_transactions 积分流水表
```sql
CREATE TABLE point_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('earn', 'spend', 'refund')),
  amount INTEGER NOT NULL,       -- 正数增加，负数减少
  reason TEXT,
  reference_id TEXT,              -- 关联业务ID（reading_id/order_id等）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### readings 解读记录表
```sql
CREATE TABLE readings (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  question_type TEXT NOT NULL,
  spread_id TEXT NOT NULL,
  cards TEXT NOT NULL,            -- JSON: [{id, is_reversed}]
  positions TEXT NOT NULL,        -- JSON: [{position, name}]
  interpretation TEXT,            -- JSON: AI解读结果
  is_cached INTEGER DEFAULT 0,     -- 是否命中缓存
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### shares 分享记录表
```sql
CREATE TABLE shares (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  reading_id TEXT NOT NULL,
  platform TEXT,                  -- wechat/friend/more
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (reading_id) REFERENCES readings(id),
  UNIQUE(user_id, reading_id)     -- 每条解读只能分享一次得积分
);
```

#### orders 支付订单表
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  package_id TEXT NOT NULL,
  package_name TEXT NOT NULL,
  points INTEGER NOT NULL,
  price REAL NOT NULL,
  wechat_order_id TEXT,
  qrcode_url TEXT,                -- 支付二维码URL
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'expired', 'cancelled')),
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expired_at DATETIME,            -- 30分钟后过期
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### config 系统配置表
```sql
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3 索引设计
```sql
-- 用户表索引
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_openid ON users(openid);

-- 签到表索引
CREATE INDEX idx_checkins_user_date ON checkins(user_id, checkin_date);

-- 积分流水索引
CREATE INDEX idx_points_user ON point_transactions(user_id);
CREATE INDEX idx_points_created ON point_transactions(created_at);

-- 解读记录索引
CREATE INDEX idx_readings_user ON readings(user_id);
CREATE INDEX idx_readings_created ON readings(created_at);

-- 订单索引
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
```

---

## 四、API接口设计

### 4.1 认证模块 `/api/auth`

#### 4.1.1 发送验证码
```
POST /api/auth/send-code
Content-Type: application/json

Request:
{
  "phone": "13800138000"
}

Response:
{
  "success": true,
  "message": "验证码已发送"
}

Error:
{
  "success": false,
  "error": "手机号格式错误"
}
```

#### 4.1.2 登录/注册
```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "phone": "13800138000",
  "code": "123456"
}

OR (微信小程序场景)

Request:
{
  "openid": "oXXXXXX"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbG...",
    "user": {
      "id": "uuid",
      "phone": "13800138000",
      "nickname": null,
      "avatar": null,
      "points": 50
    }
  }
}
```

### 4.2 用户模块 `/api/user`

#### 4.2.1 获取用户信息
```
GET /api/user/profile
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "phone": "13800138000",
    "nickname": "昵称",
    "avatar": "https://...",
    "points": 45,
    "consecutive_days": 3,
    "is_today_checkin": false,
    "created_at": "2026-03-25T10:00:00Z"
  }
}
```

### 4.3 积分模块 `/api/points`

#### 4.3.1 签到
```
POST /api/points/checkin
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "points_earned": 3,
    "total_points": 48,
    "consecutive_days": 3
  }
}

Error:
{
  "success": false,
  "error": "今天已签到"
}
```

#### 4.3.2 积分记录
```
GET /api/points/history?page=1&limit=20
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "type": "earn",
        "amount": 3,
        "reason": "每日签到奖励（第3天）",
        "created_at": "2026-03-28T08:00:00Z"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 20
  }
}
```

### 4.4 占卜模块 `/api/reading`

#### 4.4.1 开始占卜
```
POST /api/reading/start
Content-Type: application/json
Authorization: Bearer <token>  (可选)

Request:
{
  "question_type": "today"
}

Response:
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "question_type": "today",
    "spread_id": "awareness_three",
    "cards": [
      { "id": 0, "name": "愚人", "name_cn": "愚人", "emoji": "🌪" },
      ...
    ],
    "positions": [
      { "index": 0, "name": "核心能量", "meaning": "..." },
      ...
    ]
  }
}
```

#### 4.4.2 抽牌
```
POST /api/reading/draw
Content-Type: application/json

Request:
{
  "session_id": "uuid",
  "selected_indices": [3, 17, 42]  -- 用户选择的牌的索引
}

Response:
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "drawn_cards": [
      { "id": 0, "name": "愚人", "position": 0, "is_reversed": false },
      { "id": 17, "name": "星星", "position": 1, "is_reversed": true },
      { "id": 42, "name": "圣杯七", "position": 2, "is_reversed": false }
    ]
  }
}
```

#### 4.4.3 获取解读（强制登录）
```
POST /api/reading/interpret
Content-Type: application/json
Authorization: Bearer <token>  (必须)

Request:
{
  "session_id": "uuid",
  "drawn_cards": [...],
  "question_type": "today",
  "spread_id": "awareness_three"
}

Response (成功):
{
  "success": true,
  "data": {
    "reading_id": "uuid",
    "interpretation": {
      "summary": "整体能量描述...",
      "cards": [...],
      "advice": ["建议1", "建议2", ...]
    },
    "is_cached": false,
    "points_spent": 5,
    "remaining_points": 40
  }
}

Response (积分不足):
{
  "success": false,
  "error": "积分不足",
  "code": "INSUFFICIENT_POINTS",
  "need_points": 5,
  "current_points": 2
}
```

#### 4.4.4 解读历史
```
GET /api/reading/history?page=1&limit=10
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "readings": [
      {
        "id": "uuid",
        "question_type": "today",
        "spread_id": "awareness_three",
        "cards": [...],
        "interpretation": {...},
        "created_at": "2026-03-28T10:00:00Z"
      }
    ],
    "total": 5
  }
}
```

### 4.5 分享模块 `/api/share`

#### 4.5.1 分享得积分
```
POST /api/share
Content-Type: application/json
Authorization: Bearer <token>

Request:
{
  "reading_id": "uuid"
}

Response:
{
  "success": true,
  "data": {
    "already_shared": false,
    "points_earned": 3,
    "total_points": 43,
    "share_text": "🔮 我的今日运势解读..."
  }
}
```

### 4.6 支付模块 `/api/pay`

#### 4.6.1 创建订单
```
POST /api/pay/create-order
Content-Type: application/json
Authorization: Bearer <token>

Request:
{
  "package_id": "medium"
}

Response:
{
  "success": true,
  "data": {
    "order_id": "uuid",
    "qrcode_url": "https://...",
    "expired_at": "2026-03-28T18:34:00Z"
  }
}
```

#### 4.6.2 查询订单
```
GET /api/pay/order/:orderId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "package_id": "medium",
    "package_name": "中包",
    "points": 70,
    "price": 20,
    "status": "paid",
    "paid_at": "2026-03-28T18:10:00Z"
  }
}
```

### 4.7 管理后台 `/api/admin`

#### 4.7.1 管理员登录
```
POST /api/admin/login
Content-Type: application/json

Request:
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJ..."
  }
}
```

#### 4.7.2 统计数据
```
GET /api/admin/stats
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": {
    "total_users": 1250,
    "total_readings": 5632,
    "total_points": 45680,
    "today_checkins": 328,
    "today_readings": 156,
    "cache_hit_rate": "67.5%"
  }
}
```

#### 4.7.3 用户列表
```
GET /api/admin/users?page=1&limit=20&search=138
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "phone": "138****8000",
        "nickname": "昵称",
        "points": 45,
        "created_at": "2026-03-25T10:00:00Z"
      }
    ],
    "total": 1250
  }
}
```

#### 4.7.4 用户详情
```
GET /api/admin/users/:userId
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "phone": "13800138000",
    "points": 45,
    "checkins": [...],
    "transactions": [...],
    "readings": [...]
  }
}
```

#### 4.7.5 调整积分
```
POST /api/admin/users/:userId/points
Authorization: Bearer <admin_token>
Content-Type: application/json

Request:
{
  "amount": 100,
  "reason": "活动奖励"
}

Response:
{
  "success": true,
  "data": {
    "new_points": 145
  }
}
```

#### 4.7.6 配置管理
```
GET /api/admin/config
POST /api/admin/config
Authorization: Bearer <admin_token>
Content-Type: application/json

Request:
{
  "key": "ai_model",
  "value": "openrouter/qwen/qwen3-4b:free"
}
```

---

## 五、塔罗牌数据设计

### 5.1 牌库结构

```javascript
// 每张牌的数据结构
{
  id: 0,                    // 0-77
  name: "愚人",             // 中文名
  name_en: "The Fool",      // 英文名
  suit: null,               // 牌组（仅小阿尔卡纳有）
  name_cn: "愚人",          // 完整中文名
  emoji: "🌪",              // 表情图标
  meaning_upright: "...",   // 正位含义
  meaning_reversed: "..."   // 逆位含义
}
```

### 5.2 牌阵配置

| 牌阵ID | 名称 | 牌数 | 适用场景 |
|--------|------|------|---------|
| awareness_three | 觉知三阵 | 3 | 今日/明日运势 |
| weekly_plan | 周计划阵 | 8 | 本周/下周运势 |
| four_elements | 四元素平衡阵 | 5 | 本月/下月运势 |
| holy_triangle | 圣三角 | 3 | 迷茫现状 |
| relationship_mirror | 关系镜像阵 | 5 | 情感纠葛 |
| cross_spread | 十字展开阵 | 5 | 职业/财务 |
| choice_spread | 二选一分岔阵 | 5 | 重大抉择 |
| body_mind_spirit | 身心灵阵 | 3 | 灵性/心理 |

---

## 六、缓存策略

### 6.1 缓存Key设计

```
解读缓存 Key:
{question_type}_{spread_id}_{sorted_card_ids}_{reversed_flags}

示例:
today_awareness_three_1_5_23_U_U_R

含义:
- 问题类型: today
- 牌阵: awareness_three
- 牌ID排序: 1, 5, 23
- 正逆位: U(正位), U(正位), R(逆位)
```

### 6.2 缓存配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| stdTTL | 86400 (24小时) | 缓存有效期 |
| checkperiod | 3600 | 清理检查周期 |
| maxKeys | 1000 | 最大缓存条目 |

### 6.3 缓存命中统计

每次解读记录 `is_cached` 字段，统计缓存命中率。

---

## 七、AI解读设计

### 7.1 Prompt模板

```
你是瑞秋·波拉克 (Rachel Pollack)，塔罗占卜领域的传奇大师，著有经典《塔罗全书》。

请基于《塔罗全书》的理论，用温暖而深邃的智慧，帮助用户解读以下牌阵。

【问题类型】今日运势
【牌阵】觉知三阵（觉知当下的能量起伏...）

【抽到的牌】
位置1【核心能量】：愚人（正位）
  牌义：自由、天真、冒险、无限可能

位置2【潜在挑战】：星星（逆位）
  牌义：缺乏信念、绝望、自我信任...

位置3【行动指引】：圣杯七（正位）
  牌义： opportunities、 choices、 wishful thinking...

请按以下格式生成解读：

## 整体能量
（2-3句话总结整个牌阵传递的核心信息）

## 逐卡解读
### 🌟 核心能量
**愚人** ⬆️ 正位
自由、天真、冒险、无限可能
（这里写一段50-100字的深度解读）

## 行动建议
- 建议1
- 建议2
- 建议3

请用温暖、富有洞察力的语气，像一位智慧的老师和朋友一样说话
```

### 7.2 模型配置

| 环境 | 模型 | API Key |
|------|------|--------|
| 开发 | openrouter/qwen/qwen3-4b:free | 可选 |
| 生产 | openrouter/google/gemini-2.0-flash:free | 必须 |

### 7.3 兜底机制

当AI调用失败时，返回预设模板解读：
```javascript
const fallbackInterpretation = {
  summary: "今天的能量较为复杂，建议您静心思考...",
  cards: drawnCards.map(card => ({
    ...card,
    meaning: card.is_reversed ? card.meaning_reversed : card.meaning_upright
  })),
  advice: [
    "保持开放的心态",
    "注意倾听内心的声音",
    "今天适合反思和冥想"
  ]
};
```

---

## 八、支付流程设计

### 8.1 微信Native支付时序图

```
用户          H5前端         API服务器       微信支付
 │              │              │              │
 │  选择套餐    │              │              │
 │─────────────>│              │              │
 │              │  创建订单     │              │
 │              │─────────────>│              │
 │              │              │  调用统一下单  │
 │              │              │─────────────>│
 │              │              │<─────────────│
 │              │   返回二维码URL│              │
 │<─────────────│              │              │
 │  展示二维码   │              │              │
 │              │              │              │
 │  扫码支付     │              │              │
 │───────────────────────────────────────────>│
 │              │              │   支付成功    │
 │              │              │<─────────────│
 │              │              │  更新订单状态 │
 │              │              │  增加用户积分 │
 │              │              │              │
 │  支付成功提示 │              │              │
 │<─────────────│              │              │
```

### 8.2 订单状态

| 状态 | 说明 |
|------|------|
| pending | 待支付 |
| paid | 已支付 |
| expired | 已过期 |
| cancelled | 已取消 |

### 8.3 订单过期处理

- 订单创建时设置 `expired_at = now + 30分钟`
- 前端轮询订单状态，超时后提示"订单已过期"
- 后台定时任务清理过期订单

---

## 九、页面交互设计

### 9.1 用户端页面流程

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐      │
│  │ 首页 │───>│引导页│───>│洗牌页│───>│选牌页│───>│翻牌页│      │
│  └──┬──┘    └──┬──┘    └──┬──┘    └──┬──┘    └──┬──┘      │
│     │          │           │          │          │         │
│     │    ┌─────┴─────┐     │    ┌─────┴─────┐    │         │
│     │    │  选择问题  │     │    │  依次选牌  │    │         │
│     │    └─────┬─────┘     │    └─────┬─────┘    │         │
│     │          │           │          │          │         │
│     │          │     ┌─────┴──────────┘          │         │
│     │          │     │  选完后自动进入翻牌页        │         │
│     │          │     │                            │         │
│     │          │     │    ┌─────────┐    ┌─────┐  │         │
│     │          │     │    │ 强制登录 │───>│解读页│  │         │
│     │          │     │    └─────────┘    └──┬──┘  │         │
│     │          │     │                      │     │         │
│     │          │     │              ┌───────┴─────┘         │
│     │          │     │              │                       │
│     │          │     │    ┌─────────┴─────────┐              │
│     │          │     │    │  解读 + 分享     │              │
│     │          │     │    └─────────┬─────────┘              │
│     │          │     │              │                       │
│     │          │     │    ┌─────────┴─────────┐              │
│     │          │     │    │  购买积分（不足时） │              │
│     │          │     │    └───────────────────┘              │
│     │          │     │                                      │
│     └──────────┴─────┴──────────────────────────────────────┘
│                          │
│                          ↓
│                   ┌─────────────┐
│                   │   个人中心   │
│                   │  签到/历史  │
│                   └─────────────┘
```

### 9.2 页面详细说明

#### 首页
- 顶部：Logo + 积分显示
- Tab切换：短期/中期/长期/深度
- 问题卡片网格（图标+标题+描述）
- 底部：签到入口
- 背景：星空动画

#### 引导页
- 居中引导语（深呼吸+默念问题）
- 显示当前选择的问题类型
- 「开始洗牌」按钮
- 「返回」按钮

#### 洗牌页
- 3-5秒洗牌动画
- 模拟牌堆翻转效果
- 完成后自动跳转

#### 选牌页
- 顶部进度提示「请选择第X张牌（共Y张）」
- 中部：牌阵位置展示（扇形/矩阵）
- 底部：可选牌池（点击选择）
- 选择后牌飞入位置动画
- 选完自动跳转

#### 翻牌页
- 牌阵布局展示
- 点击翻开/逐张自动翻开
- **随机翻牌效果**（3种动画）
- 显示正/逆位
- 「获取解读」按钮

#### 解读页
- 整体能量描述
- 逐卡解读（可展开）
- 行动建议
- 分享按钮（点击得3积分）
- 返回首页

#### 个人中心
- 积分余额
- 连续签到天数
- 解读历史列表
- 积分购买入口

### 9.3 翻牌动画效果

| 效果ID | 名称 | 动画描述 |
|--------|------|---------|
| flip-effect-1 | 经典翻转 | rotateY 0° → 90° → 180° |
| flip-effect-2 | 3D旋转 | rotateY + rotateX 组合 |
| flip-effect-3 | 弹跳效果 | scale + rotate 组合 |

每次随机选择一种效果。

---

## 十、视觉设计规范

### 10.1 色彩系统

```css
:root {
  /* 主色 */
  --primary: #6b4c9a;          /* 深紫色 */
  --primary-dark: #4a3370;     /* 更深的紫色 */
  
  /* 强调色 */
  --gold: #d4af37;             /* 金色 */
  --gold-light: #f4e4a6;        /* 浅金色 */
  
  /* 背景色 */
  --bg-dark: #0d0d1a;           /* 深色背景 */
  --bg-card: #1a1a2e;          /* 卡片背景 */
  
  /* 文字色 */
  --text-light: #e8e8f0;       /* 浅色文字 */
  --text-muted: #9898a8;       /* 灰色文字 */
  
  /* 状态色 */
  --success: #07c160;          /* 成功绿 */
  --warning: #ff9800;          /* 警告橙 */
  --danger: #ff5252;           /* 危险红 */
}
```

### 10.2 字体规范

```css
/* 中文衬线体 - 营造神秘优雅感 */
font-family: 'Noto Serif SC', 'Source Han Serif SC', serif;

/* 英文衬线体 */
font-family: 'Cinzel', 'Playfair Display', serif;
```

### 10.3 动效规范

| 动效 | 时长 | 缓动函数 |
|------|------|---------|
| 页面切换 | 300ms | ease-in-out |
| 按钮点击 | 150ms | ease |
| 卡片悬停 | 200ms | ease |
| 翻牌动画 | 800ms | ease-in-out |
| 洗牌动画 | 600ms | linear |
| Toast出现 | 300ms | ease-out |

### 10.4 背景音乐

- 格式：MP3 / OGG
- 时长：30秒~2分钟（循环）
- 风格：神秘、空灵、水晶钵/颂钵
- 音量：默认30%
- 控制：右下角悬浮按钮，开/关

---

## 十一、断网兜底方案

### 11.1 多层保障

| 层级 | 机制 | 说明 |
|------|------|------|
| 第一层 | 本地缓存 | localStorage缓存已获取的解读 |
| 第二层 | AI缓存 | 后端相同问题+牌型24h缓存 |
| 第三层 | 模板兜底 | AI失败时返回预设模板 |

### 11.2 本地缓存策略

```javascript
// 缓存结构
{
  key: "reading_${reading_id}",
  value: {
    interpretation: {...},
    cachedAt: timestamp
  },
  ttl: 7 * 24 * 60 * 60 * 1000  // 7天
}
```

### 11.3 离线模板

当AI调用失败时，返回基于牌义的通用解读：

```javascript
const offlineTemplate = {
  summary: "今天的能量提示你需要关注...",
  cards: drawnCards.map(card => ({
    name: card.name_cn,
    position: card.position,
    is_reversed: card.is_reversed,
    meaning: card.is_reversed ? card.meaning_reversed : card.meaning_upright,
    // 简化的通用解读
    interpretation: `这张牌在当前位置暗示着${card.is_reversed ? '需要逆转思维' : '积极正向'}能量...`
  })),
  advice: [
    "保持觉察，关注内心感受",
    "今天适合静心和冥想",
    "相信自己的直觉"
  ],
  is_offline: true  // 标记为离线模板
};
```

---

## 十二、积分体系详解

### 12.1 积分获取

| 途径 | 积分 | 说明 |
|------|------|------|
| 新用户注册 | +50 | 初始额度 |
| 每日签到 | +1~+5 | 根据连续天数递增 |
|
---

## 九、当前实现状态 (2026-03-29)

### 已完成 ✅

| 功能 | 状态 | 说明 |
|------|------|------|
| 用户注册/登录 | ✅ | 用户名+密码，JWT认证 |
| 积分系统 | ✅ | 每日签到、分享奖励、消费扣积分 |
| 78张塔罗牌 | ✅ | 22大阿尔卡纳+56小阿尔卡纳 |
| 8种牌阵 | ✅ | 觉知三阵/周计划阵/圣三角等 |
| AI 解读 | ✅ | MiniMax M2.7 API，已验证 |
| 选牌交互 | ✅ | 水平滚动浏览 + 点击选牌 |
| 管理后台 | ✅ | /admin/ 用户管理/数据统计 |
| 风格 UI | ✅ | 深邃紫色+金色主题，星尘背景 |

### 图片下载进度

- **已下载本地:** 27/78 张（包含全部22张大阿尔卡纳）
- **位置:** `tarot-assets/cards/card_XX.jpg`
- **剩余:** 51 张（小阿尔卡纳）
- **下载脚本:** `tarot-assets/download_cards.py`
- **使用方法:** `python3 tarot-assets/download_cards.py`（每次1张，建议间隔30秒以上）

### 待完成

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 剩余51张图片 | 中 | Wikipedia限速，正在后台慢慢下载 |
| 真实微信支付 | 低 | 当前为Mock模式 |
| 短信验证 | 低 | 暂不需要，已用账号密码 |

### 服务地址

- **用户端 H5:** http://localhost:3005/
- **管理后台:** http://localhost:3005/admin/ (账号: admin / admin123)
- **API:** http://localhost:3005/api/

### 启动命令

```bash
cd /Users/shilu/.openclaw/workspace/agent-workspaces/xiaolu-tarot/tarot-api
node server.js
```
