/**
 * AI 解读服务 - 瑞秋·波拉克风格
 */

const axios = require('axios');
const db = require('../models/database');

// 内存缓存
const interpretationCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24小时

// 生成缓存Key
function getCacheKey(questionType, spreadId, cards) {
  const cardIds = cards.map(c => c.id).sort().join('_');
  const reversed = cards.map(c => c.is_reversed ? 'R' : 'U').join('');
  return `${questionType}_${spreadId}_${cardIds}_${reversed}`;
}

// 检查缓存
function getCachedInterpretation(cacheKey) {
  const cached = interpretationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.interpretation;
  }
  interpretationCache.delete(cacheKey);
  return null;
}

// 设置缓存
function setCachedInterpretation(cacheKey, interpretation) {
  interpretationCache.set(cacheKey, {
    interpretation,
    timestamp: Date.now()
  });
}

// 获取AI模型配置
async function getAIConfig() {
  return {
    model: 'MiniMax-M2.7',
    apiKey: await db.getConfig('ai_api_key') || ''
  };
}

// 兜底模板解读
function getFallbackInterpretation(drawnCards, spread, questionType) {
  const questionLabels = {
    today: '今日运势',
    tomorrow: '明日运势',
    thisWeek: '本周运势',
    nextWeek: '下周运势',
    thisMonth: '本月运势',
    nextMonth: '下月运势',
    currentSituation: '现状',
    relationship: '情感',
    career: '事业',
    choice: '抉择',
    spiritual: '灵性'
  };
  
  const label = questionLabels[questionType] || '运势';
  
  return {
    summary: `今天的塔罗牌阵为你揭示了${label}的整体能量走向。这些牌面的组合暗示着你正处在一个重要的转变期，需要保持觉察和开放的心态来接纳宇宙的指引。`,
    cards: drawnCards.map((card, i) => {
      const pos = spread.positions[i];
      const meaning = card.is_reversed ? card.meaning_reversed : card.meaning_upright;
      return {
        position: i,
        position_name: pos.name,
        card_name: card.name_cn,
        card_name_en: card.name_en,
        is_reversed: card.is_reversed,
        meaning: meaning,
        interpretation: `${card.name_cn}在${pos.name}位置出现，${card.is_reversed ? '逆位的能量提示你需要从相反的角度思考这个问题，可能存在一些阻碍或需要逆转的思维模式。' : '正位的能量显示这是一个积极的信号，暗示着顺利和成长。'}这张牌建议你${pos.meaning}，重点关注${meaning.split('、')[0]}这个课题。`
      };
    }),
    advice: [
      '保持内心的平静和觉察',
      '相信自己的直觉和第六感',
      '今天适合冥想和静心',
      '注意倾听内心的声音',
      '接纳当下的每一刻'
    ],
    is_fallback: true
  };
}

// 调用 Minimax API
async function callOpenAI(prompt, config) {
  const response = await axios.post(
    'https://api.minimax.chat/v1/text/chatcompletion_v2',
    {
      model: 'MiniMax-M2.7',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 2000
    },
    {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 120000
    }
  );
  
  const message = response.data.choices[0].message;
  // MiniMax M2.7 puts actual content in reasoning_content when content is empty
  return message.content || message.reasoning_content || '';
}

// 解析AI返回的解读
function parseInterpretation(text, drawnCards, spread) {
  try {
    // 提取整体能量
    let summary = '';
    const summaryMatch = text.match(/##?\s*整体能量[：:]\s*\n?([\s\S]*?)(?=##|\n\n|$)/i);
    if (summaryMatch) {
      summary = summaryMatch[1].replace(/[#*\n]/g, '').trim();
    }
    
    // 提取逐卡解读
    const cardInterpretations = [];
    const cardMatches = text.matchAll(/###\s*([^\n]+)\n+([\s\S]*?)(?=###\s*|##\s*行动|$)/gi);
    let idx = 0;
    for (const match of cardMatches) {
      if (idx >= drawnCards.length) break;
      const card = drawnCards[idx];
      const pos = spread.positions[idx];
      cardInterpretations.push({
        position: idx,
        position_name: pos.name,
        card_name: card.name_cn,
        card_name_en: card.name_en,
        is_reversed: card.is_reversed,
        meaning: card.is_reversed ? card.meaning_reversed : card.meaning_upright,
        interpretation: match[2].replace(/[#*\n]/g, '').trim()
      });
      idx++;
    }
    
    // 如果没有提取到，用默认
    if (cardInterpretations.length === 0) {
      drawnCards.forEach((card, i) => {
        const pos = spread.positions[i];
        cardInterpretations.push({
          position: i,
          position_name: pos.name,
          card_name: card.name_cn,
          is_reversed: card.is_reversed,
          meaning: card.is_reversed ? card.meaning_reversed : card.meaning_upright,
          interpretation: `${card.name_cn}在${pos.name}位置，${card.is_reversed ? '逆位' : '正位'}的能量提示${pos.meaning}。`
        });
      });
    }
    
    // 提取行动建议
    const advice = [];
    const adviceMatch = text.match(/##?\s*行动[建议]+[：:]\s*\n?([\s\S]*?)$/i);
    if (adviceMatch) {
      const lines = adviceMatch[1].split('\n');
      for (const line of lines) {
        const clean = line.replace(/^[-*\d]+\.?\s*/, '').replace(/[#*\n]/g, '').trim();
        if (clean && advice.length < 5) {
          advice.push(clean);
        }
      }
    }
    
    // 默认建议
    if (advice.length === 0) {
      advice.push('保持觉察和开放的心态');
      advice.push('相信自己的直觉');
      advice.push('今天适合静心和冥想');
    }
    
    return {
      summary: summary || '今天的能量呈现出一种平衡的状态，提示你需要在内省和行动之间找到和谐。',
      cards: cardInterpretations,
      advice,
      is_fallback: false
    };
  } catch (e) {
    console.error('解析AI解读失败:', e);
    return null;
  }
}

// 生成解读
async function generateInterpretation(questionType, spreadId, drawnCards) {
  // 检查缓存
  const cacheKey = getCacheKey(questionType, spreadId, drawnCards);
  const cached = getCachedInterpretation(cacheKey);
  if (cached) {
    return { interpretation: cached, is_cached: true };
  }
  
  // 获取牌阵信息
  const spreads = require('../../tarot-data/card_spreads');
  const spread = spreads.getSpread(spreadId);
  const questionConfig = Object.values(spreads.questionTypes).find(q => q.spread.id === spreadId);
  
  // 构建Prompt
  const cardsDescription = drawnCards.map((card, i) => {
    const pos = spread.positions[i];
    return `位置${i + 1}【${pos.name}】：${card.name_cn}（${card.is_reversed ? '逆位' : '正位'}）
  牌义：${card.is_reversed ? card.meaning_reversed : card.meaning_upright}
  位置含义：${pos.meaning}`;
  }).join('\n\n');
  
  const questionLabels = {
    today: '今日运势',
    tomorrow: '明日运势',
    thisWeek: '本周运势',
    nextWeek: '下周运势',
    thisMonth: '本月运势',
    nextMonth: '下月运势',
    currentSituation: '迷茫现状',
    relationship: '情感纠葛',
    career: '职业财务',
    choice: '重大抉择',
    spiritual: '身心灵'
  };
  
  const prompt = `你是瑞秋·波拉克 (Rachel Pollack)，塔罗占卜领域的传奇大师，著有经典《塔罗全书》。

请基于《塔罗全书》的理论，用温暖而深邃的智慧，帮助用户解读以下牌阵。

【问题类型】${questionLabels[questionType] || questionType}
【牌阵】${spread.name}（${spread.description}）

【抽到的牌】
${cardsDescription}

请按以下格式生成解读：

## 整体能量
（用2-3句话总结整个牌阵传递的核心信息，语气温暖而富有洞察力）

## 逐卡解读
（为每张牌写50-100字的深度解读，结合位置含义）

## 行动建议
（给出3-5条具体的、可操作的建议）

请用温暖、富有洞察力的语气，像一位智慧的老师和朋友一样说话。`;

  try {
    const config = await getAIConfig();
    
    // 如果没有配置API Key，使用兜底
    if (!config.apiKey) {
      console.log('未配置AI API Key，使用兜底模板');
      const fallback = getFallbackInterpretation(drawnCards, spread, questionType);
      setCachedInterpretation(cacheKey, fallback);
      return { interpretation: fallback, is_cached: false };
    }
    
    const aiResponse = await callOpenAI(prompt, config);
    const interpretation = parseInterpretation(aiResponse, drawnCards, spread);
    
    if (!interpretation) {
      throw new Error('解析失败');
    }
    
    setCachedInterpretation(cacheKey, interpretation);
    return { interpretation, is_cached: false };
    
  } catch (e) {
    console.error('AI解读失败:', e.message);
    
    // 兜底
    const fallback = getFallbackInterpretation(drawnCards, spread, questionType);
    setCachedInterpretation(cacheKey, fallback);
    return { interpretation: fallback, is_cached: false };
  }
}

module.exports = {
  generateInterpretation,
  getCacheKey,
  getCachedInterpretation
};
