/**
 * 塔罗牌数据库 - 经典韦特塔罗 78张
 */

const majorArcana = [
  { id: 0, name: "愚人", name_en: "The Fool", emoji: "🌪", meaning_upright: "自由、天真、冒险、无限可能", meaning_reversed: "轻率、冲动、空虚、缺乏方向" },
  { id: 1, name: "魔术师", name_en: "The Magician", emoji: "☀️", meaning_upright: "创造、意志力、技能、资源", meaning_reversed: "伎俩、欺骗、缺乏方向、潜能浪费" },
  { id: 2, name: "女祭司", name_en: "The High Priestess", emoji: "🌙", meaning_upright: "直觉、神秘、内在声音、智慧", meaning_reversed: "隐藏的秘密、表面化、误导、沉默" },
  { id: 3, name: "女皇", name_en: "The Empress", emoji: "🌻", meaning_upright: "丰盛、生育、关怀、富足", meaning_reversed: "空虚、依赖、停滞、创作障碍" },
  { id: 4, name: "皇帝", name_en: "The Emperor", emoji: "🪐", meaning_upright: "权威、结构、控制、领导力", meaning_reversed: "专制、僵化、缺乏纪律、父亲议题" },
  { id: 5, name: "教皇", name_en: "The Hierophant", emoji: "⛪", meaning_upright: "信仰、传统、精神导师、道德", meaning_reversed: "叛逆、不墨守成规、新方法、误导" },
  { id: 6, name: "恋人", name_en: "The Lovers", emoji: "💑", meaning_upright: "爱情、选择、和谐、价值观", meaning_reversed: "失衡、冲突、错误选择、不和谐" },
  { id: 7, name: "战车", name_en: "The Chariot", emoji: "🐎", meaning_upright: "意志力、胜利、控制、决心", meaning_reversed: "失去控制、障碍、失败、冲动" },
  { id: 8, name: "力量", name_en: "Strength", emoji: "🦁", meaning_upright: "勇气、耐心、慈悲、内在力量", meaning_reversed: "自我怀疑、软弱、不安全感、急躁" },
  { id: 9, name: "隐士", name_en: "The Hermit", emoji: "🏔", meaning_upright: "内省、单打独斗、内在探索、指引", meaning_reversed: "孤独、孤立、内在空虚、脱离群体" },
  { id: 10, name: "命运之轮", name_en: "Wheel of Fortune", emoji: "🎡", meaning_upright: "循环、命运、改变、转折点", meaning_reversed: "厄运、抗拒改变、挫折、命运" },
  { id: 11, name: "正义", name_en: "Justice", emoji: "⚖️", meaning_upright: "公平、真理、法律、平衡", meaning_reversed: "不公平、缺乏责任、不诚实、偏见" },
  { id: 12, name: "倒吊人", name_en: "The Hanged Man", emoji: "⏳", meaning_upright: "顺服、牺牲、新视角、放下", meaning_reversed: "抗拒、停滞、无意义的牺牲、犹豫不决" },
  { id: 13, name: "死神", name_en: "Death", emoji: "💀", meaning_upright: "结束、转变、过渡、释放", meaning_reversed: "抗拒改变、持续疑虑、恐惧结束、停滞" },
  { id: 14, name: "节制", name_en: "Temperance", emoji: "🌊", meaning_upright: "平衡、耐心、目的、意义", meaning_reversed: "失衡、过度、自我疗愈、错位" },
  { id: 15, name: "恶魔", name_en: "The Devil", emoji: "🔥", meaning_upright: "阴影自我、执着、成瘾、束缚", meaning_reversed: "释放限制性信念、探索黑暗思想、分离、重获力量" },
  { id: 16, name: "塔", name_en: "The Tower", emoji: "⚡", meaning_upright: "突变、动荡、混乱、启示", meaning_reversed: "个人转变、恐惧变化、避免灾难、内心动荡" },
  { id: 17, name: "星星", name_en: "The Star", emoji: "⭐", meaning_upright: "希望、信念、目的、更新、精神", meaning_reversed: "缺乏信念、绝望、信任缺失、断联" },
  { id: 18, name: "月亮", name_en: "The Moon", emoji: "🌝", meaning_upright: "幻象、恐惧、焦虑、潜意识、直觉", meaning_reversed: "释放恐惧、被压抑的情绪、内心困惑、找到清晰" },
  { id: 19, name: "太阳", name_en: "The Sun", emoji: "☀️", meaning_upright: "快乐、成功、辐射能量、活力", meaning_reversed: "暂时挫折、感到孤立、过于乐观、缺乏理解" },
  { id: 20, name: "审判", name_en: "Judgement", emoji: "📯", meaning_upright: "反思、审判、觉醒、重生", meaning_reversed: "自我怀疑、被忽视的召唤、缺乏成长、自我评判" },
  { id: 21, name: "世界", name_en: "The World", emoji: "🌍", meaning_upright: "成就、完成、整合、旅行", meaning_reversed: "寻求个人闭环、捷径、延迟、未完成" }
];

const wands = [
  { id: 22, suit: "权杖", name: "Ace of Wands", name_cn: "权杖Ace", emoji: "🔥", meaning_upright: "灵感、新机会、成长、潜力", meaning_reversed: "创作障碍、延迟、缺乏动力、失衡" },
  { id: 23, suit: "权杖", name: "Two of Wands", name_cn: "权杖二", emoji: "🏰", meaning_upright: "未来规划、进步、决定、发现", meaning_reversed: "恐惧未知、缺乏规划、保守、错误决定" },
  { id: 24, suit: "权杖", name: "Three of Wands", name_cn: "权杖三", emoji: "⛵", meaning_upright: "远见、引领他人、进步、延迟的成功", meaning_reversed: "障碍、延迟、挫折、视野有限" },
  { id: 25, suit: "权杖", name: "Four of Wands", name_cn: "权杖四", emoji: "🏡", meaning_upright: "庆祝、和谐、婚姻、家庭、社区", meaning_reversed: "缺乏支持、不稳定、紧张、冲突" },
  { id: 26, suit: "权杖", name: "Five of Wands", name_cn: "权杖五", emoji: "⚔️", meaning_upright: "冲突、分歧、竞争、紧张", meaning_reversed: "避免冲突、尊重差异、内心冲突、冲突解决" },
  { id: 27, suit: "权杖", name: "Six of Wands", name_cn: "权杖六", emoji: "🏆", meaning_upright: "成功、公众认可、进步、自信", meaning_reversed: "自我、失去声望、失败、最后关头跌倒" },
  { id: 28, suit: "权杖", name: "Seven of Wands", name_cn: "权杖七", emoji: "🛡️", meaning_upright: "挑战、竞争、保护、坚持", meaning_reversed: "疲惫、放弃、精疲力竭、被障碍压垮" },
  { id: 29, suit: "权杖", name: "Eight of Wands", name_cn: "权杖八", emoji: "💨", meaning_upright: "行动、运动、快速决定、快速节奏", meaning_reversed: "延迟、挫折、抗拒变化、内部速战速决" },
  { id: 30, suit: "权杖", name: "Nine of Wands", name_cn: "权杖九", emoji: "🏰", meaning_upright: "韧性、勇气、持久、信仰考验", meaning_reversed: "疲惫、偏执、放弃、压倒" },
  { id: 31, suit: "权杖", name: "Ten of Wands", name_cn: "权杖十", emoji: "🪨", meaning_upright: "负担、责任、辛苦工作、压力", meaning_reversed: "亲力亲为、授权、释放、负担过重" },
  { id: 32, suit: "权杖", name: "Page of Wands", name_cn: "权杖侍者", emoji: "🧒", meaning_upright: "探索、兴奋、自由、发现", meaning_reversed: "挫折、缺乏方向、拖延、全新开始" },
  { id: 33, suit: "权杖", name: "Knight of Wands", name_cn: "权杖骑士", emoji: "🐎", meaning_upright: "能量、热情、行动、冒险、冲动", meaning_reversed: "冲动、爆发、战斗、热衷、延迟" },
  { id: 34, suit: "权杖", name: "Queen of Wands", name_cn: "权杖皇后", emoji: "👸", meaning_upright: "勇气、自信、独立、社交达人", meaning_reversed: "自我肯定、雄心、炫耀、过度骄傲" },
  { id: 35, suit: "权杖", name: "King of Wands", name_cn: "权杖国王", emoji: "👑", meaning_upright: "天生领袖、愿景、企业家精神、荣誉", meaning_reversed: "冲动、征服者、激进、高期望" }
];

const cups = [
  { id: 36, suit: "圣杯", name: "Ace of Cups", name_cn: "圣杯Ace", emoji: "💧", meaning_upright: "新感情、灵性、直觉、爱", meaning_reversed: "情感空虚、空洞、被压抑的情绪、疗愈" },
  { id: 37, suit: "圣杯", name: "Two of Cups", name_cn: "圣杯二", emoji: "💑", meaning_upright: "统一、相互吸引、伙伴关系、和谐关系", meaning_reversed: "失衡、紧张、缺乏和谐、沟通破裂" },
  { id: 38, suit: "圣杯", name: "Three of Cups", name_cn: "圣杯三", emoji: "👯", meaning_upright: "庆祝、友谊、创意、协作", meaning_reversed: "秘密、悲伤、陷阱、竞争团队" },
  { id: 39, suit: "圣杯", name: "Four of Cups", name_cn: "圣杯四", emoji: "😔", meaning_upright: "沉思、冥想、冷漠、重新评估", meaning_reversed: "突然觉醒、选择幸福、接受、希望" },
  { id: 40, suit: "圣杯", name: "Five of Cups", name_cn: "圣杯五", emoji: "😢", meaning_upright: "失落、悲伤、遗憾、错过机会", meaning_reversed: "接受、继续前进、找到平静、个人疗愈" },
  { id: 41, suit: "圣杯", name: "Six of Cups", name_cn: "圣杯六", emoji: "👧", meaning_upright: "怀旧、记忆、纯真、快乐", meaning_reversed: "活在过去、不成熟、缺乏经验疗愈过去" },
  { id: 42, suit: "圣杯", name: "Seven of Cups", name_cn: "圣杯七", emoji: "🎭", meaning_upright: "机会、选择、幻想、分心", meaning_reversed: "一致、个人价值观、分散能量、优先级不清" },
  { id: 43, suit: "圣杯", name: "Eight of Cups", name_cn: "圣杯八", emoji: "🏃", meaning_upright: "走开、幻灭、离开、寻找真理", meaning_reversed: "害怕改变、犹豫不决、漫无目的漂流、选择留下" },
  { id: 44, suit: "圣杯", name: "Nine of Cups", name_cn: "圣杯九", emoji: "😌", meaning_upright: "满足、满意、感恩、心愿达成", meaning_reversed: "不满、贪婪、物质主义、表面幸福" },
  { id: 45, suit: "圣杯", name: "Ten of Cups", name_cn: "圣杯十", emoji: "🏠", meaning_upright: "一致、非常满意、生活目标、真实真理", meaning_reversed: "错位、分歧、肤浅、不满足" },
  { id: 46, suit: "圣杯", name: "Page of Cups", name_cn: "圣杯侍者", emoji: "🧒", meaning_upright: "创意机会、直觉信息、好奇心、可能性", meaning_reversed: "自我保护、情感不成熟、逃避、情绪化" },
  { id: 47, suit: "圣杯", name: "Knight of Cups", name_cn: "圣杯骑士", emoji: "🐎", meaning_upright: "浪漫、魅力、想象、跟随心", meaning_reversed: "过度想象、不切实际、嫉妒、情绪化" },
  { id: 48, suit: "圣杯", name: "Queen of Cups", name_cn: "圣杯皇后", emoji: "👸", meaning_upright: "慈悲、平静、情商高、情感安全", meaning_reversed: "自我照顾、自爱、牺牲、自我欺骗" },
  { id: 49, suit: "圣杯", name: "King of Cups", name_cn: "圣杯国王", emoji: "👑", meaning_upright: "情商平衡、慈悲、圆滑、平静", meaning_reversed: "自我同情、内心感受、自我照顾、情绪化" }
];

const swords = [
  { id: 50, suit: "宝剑", name: "Ace of Swords", name_cn: "宝剑Ace", emoji: "🗡️", meaning_upright: "突破、清晰、敏锐心智、真理", meaning_reversed: "混乱、残暴、混乱、痛苦" },
  { id: 51, suit: "宝剑", name: "Two of Swords", name_cn: "宝剑二", emoji: "⚔️", meaning_upright: "困难选择、犹豫不决、僵局、被压抑的情绪", meaning_reversed: "信息过载、困惑、犹豫不决、被压抑的情绪" },
  { id: 52, suit: "宝剑", name: "Three of Swords", name_cn: "宝剑三", emoji: "💔", meaning_upright: "心碎、情绪痛苦、悲伤、悲痛", meaning_reversed: "负面自我对话、释放痛苦、乐观、继续前进" },
  { id: 53, suit: "宝剑", name: "Four of Swords", name_cn: "宝剑四", emoji: "🛏️", meaning_upright: "休息、放松、冥想、沉思、恢复", meaning_reversed: "不安、倦怠、深度沉思、崩溃" },
  { id: 54, suit: "宝剑", name: "Five of Swords", name_cn: "宝剑五", emoji: "🏴", meaning_upright: "冲突、分歧、竞争、失败、不择手段获胜", meaning_reversed: " lingering resentment、 reconciliation、 open to change、 defeat" },
  { id: 55, suit: "宝剑", name: "Six of Swords", name_cn: "宝剑六", emoji: "⛵", meaning_upright: "过渡、离开、继续前进、精神旅程", meaning_reversed: "艰难水域、不稳定条件、抗拒过渡、未完成事务" },
  { id: 56, suit: "宝剑", name: "Seven of Swords", name_cn: "宝剑七", emoji: "🗡️", meaning_upright: "欺骗、侥幸逃脱、策略、警觉", meaning_reversed: "坦白、自我欺骗、真相揭露、坦白" },
  { id: 57, suit: "宝剑", name: "Eight of Swords", name_cn: "宝剑八", emoji: "⛓️", meaning_upright: "监禁、限制、限制性信念、自我受害者", meaning_reversed: "向变化敞开、新视角、成长机会、重获控制" },
  { id: 58, suit: "宝剑", name: "Nine of Swords", name_cn: "宝剑九", emoji: "😰", meaning_upright: "焦虑、担忧、恐惧、噩梦", meaning_reversed: "面对恐惧、克服焦虑、释放担忧、找到内心平静" },
  { id: 59, suit: "宝剑", name: "Ten of Swords", name_cn: "宝剑十", emoji: "💀", meaning_upright: "结束、深痛、触底、财务损失、危机", meaning_reversed: "从损失中恢复、再生、抵抗必然结束、恐惧毁灭" },
  { id: 60, suit: "宝剑", name: "Page of Swords", name_cn: "宝剑侍者", emoji: "🧒", meaning_upright: "新想法、好奇心、渴求知识、沟通", meaning_reversed: "自我表达、光说不做、脑子乱、防卫" },
  { id: 61, suit: "宝剑", name: "Knight of Swords", name_cn: "宝剑骑士", emoji: "🐎", meaning_upright: "行动、野心、快速 paced、驱动、 force", meaning_reversed: "自我正义、被贪婪驱动、过度 force、无情" },
  { id: 62, suit: "宝剑", name: "Queen of Swords", name_cn: "宝剑皇后", emoji: "👸", meaning_upright: "独立、不偏颇判断、清晰边界、直接", meaning_reversed: "冷心、残酷、尖刻、太苛刻" },
  { id: 63, suit: "宝剑", name: "King of Swords", name_cn: "宝剑国王", emoji: "👑", meaning_upright: "智力权力、权威、真理、清晰思维", meaning_reversed: "滥用权力、操纵、威权、滥用" }
];

const pentacles = [
  { id: 64, suit: "星币", name: "Ace of Pentacles", name_cn: "星币Ace", emoji: "🌰", meaning_upright: "新财务机会、显化、富足", meaning_reversed: "错过机会、缺乏规划、财务决策失误" },
  { id: 65, suit: "星币", name: "Two of Pentacles", name_cn: "星币二", emoji: "🎭", meaning_upright: "多优先级、时间管理、优先级、适应", meaning_reversed: "承诺过多、无序、混乱、丢球" },
  { id: 66, suit: "星币", name: "Three of Pentacles", name_cn: "星币三", emoji: "👷", meaning_upright: "团队合作、协作、学习、实施", meaning_reversed: "独自工作、不统一、团队问题、缺乏协调" },
  { id: 67, suit: "星币", name: "Four of Pentacles", name_cn: "星币四", emoji: "🧍", meaning_upright: "存钱、安全、保守、稀缺", meaning_reversed: "过度消费、贪婪、自我保护、花钱松散" },
  { id: 68, suit: "星币", name: "Five of Pentacles", name_cn: "星币五", emoji: "🏠", meaning_upright: "财务损失、贫困、匮乏心态、孤立", meaning_reversed: "从损失中恢复、精神匮乏、重新评估、全新赏识" },
  { id: 69, suit: "星币", name: "Six of Pentacles", name_cn: "星币六", emoji: "🎁", meaning_upright: "给予、接受、分享财富、慷慨、慈善", meaning_reversed: "附加条件、债务、欠钱、单向慈善" },
  { id: 70, suit: "星币", name: "Seven of Pentacles", name_cn: "星币七", emoji: "🌾", meaning_upright: "长期视角、可持续结果、毅力、投资", meaning_reversed: "缺乏长期视野、有限成功、急于求成、回馈少" },
  { id: 71, suit: "星币", name: "Eight of Pentacles", name_cn: "星币八", emoji: "🏗️", meaning_upright: "学徒期、重复任务、精通、技能发展", meaning_reversed: "自我发展、过于专注细节、不见大局、从错误中学习" },
  { id: 72, suit: "星币", name: "Nine of Pentacles", name_cn: "星币九", emoji: "🏡", meaning_upright: "富足、奢侈、自给自足、财务独立", meaning_reversed: "过度投资自己、忙碌文化、工作生活失衡、匮乏心态" },
  { id: 73, suit: "星币", name: "Ten of Pentacles", name_cn: "星币十", emoji: "🏛️", meaning_upright: "遗产、家庭、继承、长期成功、退休", meaning_reversed: "家庭冲突、财务失败、孤独、失落" },
  { id: 74, suit: "星币", name: "Page of Pentacles", name_cn: "星币侍者", emoji: "🧒", meaning_upright: "显化、新财务机会、技能发展", meaning_reversed: "缺乏进展、错误开始、拖延、从失败中学习" },
  { id: 75, suit: "星币", name: "Knight of Pentacles", name_cn: "星币骑士", emoji: "🐎", meaning_upright: "效率、常规、保守、工作 ethic", meaning_reversed: "无聊、停滞、感到被困、完美主义" },
  { id: 76, suit: "星币", name: "Queen of Pentacles", name_cn: "星币皇后", emoji: "👸", meaning_upright: "养育、实际、创造温馨环境、供养生活", meaning_reversed: "自我照顾、工作家庭冲突、财务独立、忽视家庭生活" },
  { id: 77, suit: "星币", name: "King of Pentacles", name_cn: "星币国王", emoji: "👑", meaning_upright: "财富、商业、领导力、安全、纪律", meaning_reversed: "贪婪、物质主义、冲动购买、财富执着" }
];

const allCards = [...majorArcana, ...wands, ...cups, ...swords, ...pentacles];

module.exports = {
  majorArcana,
  wands,
  cups,
  swords,
  pentacles,
  allCards,
  
  getAllCards: () => allCards,
  
  getCardById: (id) => allCards.find(c => c.id === id),
  
  shuffleCards: (count = 78) => {
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },
  
  isMajorArcana: (id) => id >= 0 && id <= 21,
  
  getSuit: (id) => {
    if (id <= 21) return 'major';
    if (id <= 35) return 'wands';
    if (id <= 49) return 'cups';
    if (id <= 63) return 'swords';
    return 'pentacles';
  }
};
