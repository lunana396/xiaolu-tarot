/**
 * 辅助函数
 */

const QRCode = require('qrcode');

const PACKAGES = {
  basic: { id: 'basic', name: '基础包', price: 1, points: 1 },
  small: { id: 'small', name: '小包', price: 10, points: 30 },
  medium: { id: 'medium', name: '中包', price: 20, points: 70 },
  large: { id: 'large', name: '大包', price: 30, points: 100 },
  xlarge: { id: 'xlarge', name: '超大包', price: 50, points: 200 }
};

function getPackage(packageId) {
  return PACKAGES[packageId];
}

function getAllPackages() {
  return Object.values(PACKAGES);
}

async function generateQRCode(text) {
  return QRCode.toDataURL(text);
}

function generateShareText(questionType, readingId) {
  const questionLabels = {
    today: '今日运势',
    tomorrow: '明日运势',
    thisWeek: '本周运势',
    nextWeek: '下周运势',
    thisMonth: '本月运势',
    nextMonth: '下月运势',
    currentSituation: '现状解读',
    relationship: '情感解读',
    career: '事业解读',
    choice: '抉择分析',
    spiritual: '灵性指引'
  };
  
  return `🔮 我的${questionLabels[questionType] || '塔罗'}解读

我在小鹿塔罗占卜抽到了神秘的塔罗牌阵✨
点击查看我的专属解读👇

#小鹿塔罗 #塔罗占卜`;
}

module.exports = {
  PACKAGES,
  getPackage,
  getAllPackages,
  generateQRCode,
  generateShareText
};
