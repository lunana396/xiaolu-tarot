# 小鹿塔罗占卜 - 技术文档

## 快速启动

```bash
cd tarot-api
npm install
node server.js
```

- **API**: http://localhost:3001
- **用户端**: 打开 `tarot-h5/index.html`
- **管理后台**: 打开 `tarot-admin/index.html`
- **管理员账号**: `admin` / `admin123`

## 项目结构

```
xiaolu-tarot/
├── tarot-api/
│   ├── server.js           # 主服务
│   ├── helpers.js          # 辅助函数
│   ├── models/database.js  # 数据库（sql.js）
│   └── services/ai.js      # AI解读服务
├── tarot-data/
│   ├── tarot_db.js         # 78张塔罗牌数据
│   └── card_spreads.js    # 牌阵配置
├── tarot-h5/
│   └── index.html          # 用户端H5
├── tarot-admin/
│   └── index.html          # 管理后台
└── SPEC.md                # 详细设计文档
```

## 功能清单

| 功能 | 状态 | 说明 |
|------|------|------|
| 用户登录 | ✅ | 手机号+验证码 |
| 积分体系 | ✅ | 初始50/签到/消耗/分享奖励 |
| 签到 | ✅ | 连续签到递增奖励 |
| 占卜流程 | ✅ | 洗牌→选牌→翻牌→解读 |
| 牌阵 | ✅ | 8种牌阵（觉知三阵/周计划阵等） |
| AI解读 | ✅ | 瑞秋·波拉克人设 + 24h缓存 |
| 分享得积分 | ✅ | 分享解读 +3积分 |
| 微信支付 | ✅ | Native二维码（开发环境模拟） |
| 管理后台 | ✅ | 用户/配置/统计 |
| 随机翻牌效果 | ✅ | 3种动画 |
| 背景音乐 | ✅ | 可配置 |
| 断网兜底 | ✅ | 模板解读 |

## API接口

### 认证
- `POST /api/auth/send-code` - 发送验证码
- `POST /api/auth/login` - 登录

### 用户
- `GET /api/user/profile` - 用户信息

### 积分
- `POST /api/points/checkin` - 签到
- `GET /api/points/history` - 积分记录

### 占卜
- `POST /api/reading/start` - 开始占卜
- `POST /api/reading/draw` - 抽牌
- `POST /api/reading/interpret` - 获取解读
- `GET /api/reading/history` - 解读历史

### 分享
- `POST /api/share` - 分享得积分

### 支付
- `GET /api/packages` - 套餐列表
- `POST /api/pay/create-order` - 创建订单
- `GET /api/pay/order/:id` - 订单状态

### 管理
- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/stats` - 统计数据
- `GET /api/admin/users` - 用户列表
- `POST /api/admin/users/:id/points` - 调整积分
- `GET/POST /api/admin/config` - 系统配置

## 配置

在管理后台配置：
- AI模型（默认 `openrouter/qwen/qwen3-4b:free`）
- OpenRouter API Key
- 微信支付参数
- 积分套餐

## 待完善

- 真实塔罗牌图片
- 真实微信支付商户号
- 短信验证码网关
- 背景音乐文件
