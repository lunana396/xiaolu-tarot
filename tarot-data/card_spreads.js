/**
 * 塔罗牌牌阵配置 - Phase 1
 */

const cardSpreads = {
  // 觉知三阵 - 短期运势
  awareness_three: {
    id: 'awareness_three',
    name: '觉知三阵',
    name_en: 'Awareness Three',
    category: 'short',
    cardCount: 3,
    description: '觉知当下的能量起伏，帮助你更好地理解和应对今天的挑战与机遇。',
    positions: [
      { index: 0, name: '核心能量', meaning: '今天整体的能量基调，你需要注意的核心主题', symbol: '🌟' },
      { index: 1, name: '潜在挑战', meaning: '今天可能遇到的小摩擦或阻碍', symbol: '⚡' },
      { index: 2, name: '行动指引', meaning: '如何获得今天的最佳结果', symbol: '🎯' }
    ]
  },

  // 周计划阵 - 本周/下周运势
  weekly_plan: {
    id: 'weekly_plan',
    name: '周计划阵',
    name_en: 'Weekly Plan',
    category: 'medium',
    cardCount: 8,
    description: '逐日展示一周的能量起伏，并揭示本周的核心灵魂课题。',
    positions: [
      { index: 0, name: '周一', meaning: '周一的能量和注意事项', symbol: '🌙' },
      { index: 1, name: '周二', meaning: '周二的能量和注意事项', symbol: '🔥' },
      { index: 2, name: '周三', meaning: '周三的能量和注意事项', symbol: '⚔️' },
      { index: 3, name: '周四', meaning: '周四的能量和注意事项', symbol: '🌳' },
      { index: 4, name: '周五', meaning: '周五的能量和注意事项', symbol: '💚' },
      { index: 5, name: '周六', meaning: '周六的能量和注意事项', symbol: '💜' },
      { index: 6, name: '周日', meaning: '周日的能量和注意事项', symbol: '☀️' },
      { index: 7, name: '本周灵魂课题', meaning: '这周的整体核心课题和成长机会', symbol: '🧭' }
    ]
  },

  // 四元素平衡阵 - 本月/下月运势
  four_elements: {
    id: 'four_elements',
    name: '四元素平衡阵',
    name_en: 'Four Elements Balance',
    category: 'medium',
    cardCount: 5,
    description: '揭示本月在不同生活领域的能量分布，帮助你平衡各方面的发展。',
    positions: [
      { index: 0, name: '权杖', meaning: '行动/工作/热情 - 你在事业和行动方面的能量', symbol: '🔥', element: 'fire' },
      { index: 1, name: '圣杯', meaning: '情感/人际关系 - 你在感情和社交方面的能量', symbol: '💧', element: 'water' },
      { index: 2, name: '宝剑', meaning: '思维/决策/压力 - 你在沟通和心智方面的能量', symbol: '🗡️', element: 'air' },
      { index: 3, name: '星币', meaning: '物质/财务/健康 - 你在金钱和身体方面的能量', symbol: '🌰', element: 'earth' },
      { index: 4, name: '中心', meaning: '本月核心趋势 - 贯穿全月的主题能量', symbol: '🌍', element: 'center' }
    ]
  },

  // 圣三角 - 迷茫现状
  holy_triangle: {
    id: 'holy_triangle',
    name: '圣三角',
    name_en: 'Holy Triangle',
    category: 'deep',
    cardCount: 3,
    description: '揭示问题的过去根源、当前显化和未来趋势。',
    positions: [
      { index: 0, name: '过去', meaning: '问题的根源和起因', symbol: '⏮️', time: 'past' },
      { index: 1, name: '现状', meaning: '当前正在发生和显化的状态', symbol: '⏺️', time: 'present' },
      { index: 2, name: '未来', meaning: '如果不改变，未来的发展趋势', symbol: '⏭️', time: 'future' }
    ]
  },

  // 关系镜像阵 - 情感纠葛
  relationship_mirror: {
    id: 'relationship_mirror',
    name: '关系镜像阵',
    name_en: 'Relationship Mirror',
    category: 'deep',
    cardCount: 5,
    description: '揭示关系中双方的心境、沟通模式和潜在发展。',
    positions: [
      { index: 0, name: '你的心境', meaning: '你在这段关系中的真实感受和状态', symbol: '💭' },
      { index: 1, name: '对方的心境', meaning: '对方在这段关系中的感受和想法', symbol: '💭' },
      { index: 2, name: '沟通现状', meaning: '你们之间目前的沟通模式', symbol: '💬' },
      { index: 3, name: '阻碍', meaning: '当前关系发展的主要障碍', symbol: '🧱' },
      { index: 4, name: '潜在结果', meaning: '如果双方都做出正向改变，关系的可能走向', symbol: '🌈' }
    ]
  },

  // 十字展开阵 - 职业/财务
  cross_spread: {
    id: 'cross_spread',
    name: '十字展开阵',
    name_en: 'Cross Spread',
    category: 'deep',
    cardCount: 5,
    description: '深入分析核心问题及其各个影响因素。',
    positions: [
      { index: 0, name: '核心问题', meaning: '当前最核心的问题或挑战', symbol: '🎯' },
      { index: 1, name: '阻碍', meaning: '阻止你达成目标的主要障碍', symbol: '🛑' },
      { index: 2, name: '目标', meaning: '你真正想要达成的目标', symbol: '🏆' },
      { index: 3, name: '基础', meaning: '你现有的资源和基础', symbol: '🏗️' },
      { index: 4, name: '最终结论', meaning: '综合分析后的结论和建议', symbol: '📜' }
    ]
  },

  // 二选一分岔阵 - 重大抉择
  choice_spread: {
    id: 'choice_spread',
    name: '二选一分岔阵',
    name_en: 'Fork in the Road',
    category: 'deep',
    cardCount: 5,
    description: '对比分析两个选择各自的近期和远期发展。',
    positions: [
      { index: 0, name: '现状', meaning: '做出选择前的当前状态', symbol: '🌍' },
      { index: 1, name: '选项A近期', meaning: '选择A的近期发展（1-3个月）', symbol: 'A' },
      { index: 2, name: '选项A远期', meaning: '选择A的远期结果（6-12个月）', symbol: 'A' },
      { index: 3, name: '选项B发展', meaning: '选择B的发展轨迹', symbol: 'B' },
      { index: 4, name: '选项B结果', meaning: '选择B最终可能的结果', symbol: 'B' }
    ]
  },

  // 身心灵阵 - 灵性/心理
  body_mind_spirit: {
    id: 'body_mind_spirit',
    name: '身心灵阵',
    name_en: 'Body-Mind-Spirit',
    category: 'deep',
    cardCount: 3,
    description: '从身体、情绪和精神三个维度全面审视问题。',
    positions: [
      { index: 0, name: '身体', meaning: '物质层面的呈现和行动建议', symbol: '🏃', aspect: 'body' },
      { index: 1, name: '情绪', meaning: '心理和情感层面的状态和疗愈', symbol: '🌊', aspect: 'emotion' },
      { index: 2, name: '精神', meaning: '灵魂和直觉层面的指引', symbol: '🧘', aspect: 'spirit' }
    ]
  }
};

// 问题类型映射
const questionTypes = {
  today: { spread: 'awareness_three', timeLabel: '今日' },
  tomorrow: { spread: 'awareness_three', timeLabel: '明日' },
  thisWeek: { spread: 'weekly_plan', timeLabel: '本周' },
  nextWeek: { spread: 'weekly_plan', timeLabel: '下周' },
  thisMonth: { spread: 'four_elements', timeLabel: '本月' },
  nextMonth: { spread: 'four_elements', timeLabel: '下月' },
  currentSituation: { spread: 'holy_triangle', timeLabel: '现状' },
  relationship: { spread: 'relationship_mirror', timeLabel: '情感' },
  career: { spread: 'cross_spread', timeLabel: '事业' },
  choice: { spread: 'choice_spread', timeLabel: '抉择' },
  spiritual: { spread: 'body_mind_spirit', timeLabel: '灵性' }
};

function getSpread(spreadId) {
  return cardSpreads[spreadId];
}

function getQuestionType(typeId) {
  const config = questionTypes[typeId];
  if (!config) return null;
  return {
    id: typeId,
    ...config,
    spread: cardSpreads[config.spread]
  };
}

function getSpreadsByCategory(category) {
  return Object.values(cardSpreads).filter(s => s.category === category);
}

function getAllQuestionTypes() {
  return Object.entries(questionTypes).map(([id, config]) => ({
    id,
    ...config,
    spread: cardSpreads[config.spread]
  }));
}

module.exports = {
  cardSpreads,
  questionTypes,
  getSpread,
  getQuestionType,
  getSpreadsByCategory,
  getAllQuestionTypes
};
