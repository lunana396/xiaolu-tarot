/**
 * 塔罗牌图片URL - Rider-Waite 公版
 * 使用完整尺寸图片（不用thumbnail），避免Wikipedia限速
 */

const tarotImages = {
  // 大阿尔卡纳 (Major Arcana) - Rider-Waite 完整尺寸
  majorArcana: {
    0: { name: "愚人", name_en: "The_Fool", img: "https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg" },
    1: { name: "魔术师", name_en: "The_Magician", img: "https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg" },
    2: { name: "女祭司", name_en: "The_High_Priestess", img: "https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg" },
    3: { name: "女皇", name_en: "The_Empress", img: "https://upload.wikimedia.org/wikipedia/commons/d/d2/RWS_Tarot_03_Empress.jpg" },
    4: { name: "皇帝", name_en: "The_Emperor", img: "https://upload.wikimedia.org/wikipedia/commons/c/c3/RWS_Tarot_04_Emperor.jpg" },
    5: { name: "教皇", name_en: "The_Hierophant", img: "https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_05_Hierophant.jpg" },
    6: { name: "恋人", name_en: "The_Lovers", img: "https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_06_Lovers.jpg" },
    7: { name: "战车", name_en: "The_Chariot", img: "https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg" },
    8: { name: "力量", name_en: "Strength", img: "https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg" },
    9: { name: "隐士", name_en: "The_Hermit", img: "https://upload.wikimedia.org/wikipedia/commons/4/4d/RWS_Tarot_09_Hermit.jpg" },
    10: { name: "命运之轮", name_en: "Wheel_of_Fortune", img: "https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg" },
    11: { name: "正义", name_en: "Justice", img: "https://upload.wikimedia.org/wikipedia/commons/e/e0/RWS_Tarot_11_Justice.jpg" },
    12: { name: "倒吊人", name_en: "The_Hanged_Man", img: "https://upload.wikimedia.org/wikipedia/commons/2/2b/RWS_Tarot_12_Hanged_Man.jpg" },
    13: { name: "死神", name_en: "Death", img: "https://upload.wikimedia.org/wikipedia/commons/d/d7/RWS_Tarot_13_Death.jpg" },
    14: { name: "节制", name_en: "Temperance", img: "https://upload.wikimedia.org/wikipedia/commons/f/f8/RWS_Tarot_14_Temperance.jpg" },
    15: { name: "恶魔", name_en: "The_Devil", img: "https://upload.wikimedia.org/wikipedia/commons/5/55/RWS_Tarot_15_Devil.jpg" },
    16: { name: "塔", name_en: "The_Tower", img: "https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg" },
    17: { name: "星星", name_en: "The_Star", img: "https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_17_Star.jpg" },
    18: { name: "月亮", name_en: "The_Moon", img: "https://upload.wikimedia.org/wikipedia/commons/7/7f/RWS_Tarot_18_Moon.jpg" },
    19: { name: "太阳", name_en: "The_Sun", img: "https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg" },
    20: { name: "审判", name_en: "Judgement", img: "https://upload.wikimedia.org/wikipedia/commons/d/dd/RWS_Tarot_20_Judgement.jpg" },
    21: { name: "世界", name_en: "The_World", img: "https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg" }
  },

  // 权杖 (Wands) - Rider-Waite 完整尺寸
  wands: {
    22: { name: "权杖Ace", name_en: "Ace_of_Wands", img: "https://upload.wikimedia.org/wikipedia/commons/1/11/Wands01.jpg" },
    23: { name: "权杖二", name_en: "Two_of_Wands", img: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Wands02.jpg" },
    24: { name: "权杖三", name_en: "Three_of_Wands", img: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Wands03.jpg" },
    25: { name: "权杖四", name_en: "Four_of_Wands", img: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Wands04.jpg" },
    26: { name: "权杖五", name_en: "Five_of_Wands", img: "https://upload.wikimedia.org/wikipedia/commons/9d/Wands05.jpg" },
    27: { name: "权杖六", name_en: "Six_of_Wands", img: "https://upload.wikimedia.org/wikipedia/commons/3b/Wands06.jpg" },
    28: { name: "权杖七", name_en: "Seven_of_Wands", img: "https://upload.wikimedia.org/wikipedia/commons/e4/Wands07.jpg" },
    29: { name: "权杖八", name_en: "Eight_of_Wands", img: "https://upload.wikimedia.org/wikipedia/commons/6b/Wands08.jpg" },
    30: { name: "权杖九", name_en: "Nine_of_Wands", img: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Wands09.jpg" },
    31: { name: "权杖十", name_en: "Ten_of_Wands", img: "https://upload.wikimedia.org/wikipedia/commons/0b/Wands10.jpg" },
    32: { name: "权杖侍者", name_en: "Page_of_Wands", img: "https://upload.wikimedia.org/wikipedia/commons/6a/Wands11.jpg" },
    33: { name: "权杖骑士", name_en: "Knight_of_Wands", img: "https://upload.wikimedia.org/wikipedia/commons/16/Wands12.jpg" },
    34: { name: "权杖皇后", name_en: "Queen_of_Wands", img: "https://upload.wikimedia.org/wikipedia/commons/0d/Wands13.jpg" },
    35: { name: "权杖国王", name_en: "King_of_Wands", img: "https://upload.wikimedia.org/wikipedia/commons/ce/Wands14.jpg" }
  },

  // 圣杯 (Cups) - Rider-Waite 完整尺寸
  cups: {
    36: { name: "圣杯Ace", name_en: "Ace_of_Cups", img: "https://upload.wikimedia.org/wikipedia/commons/3/36/Cups01.jpg" },
    37: { name: "圣杯二", name_en: "Two_of_Cups", img: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Cups02.jpg" },
    38: { name: "圣杯三", name_en: "Three_of_Cups", img: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Cups03.jpg" },
    39: { name: "圣杯四", name_en: "Four_of_Cups", img: "https://upload.wikimedia.org/wikipedia/commons/3/35/Cups04.jpg" },
    40: { name: "圣杯五", name_en: "Five_of_Cups", img: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Cups05.jpg" },
    41: { name: "圣杯六", name_en: "Six_of_Cups", img: "https://upload.wikimedia.org/wikipedia/commons/1/17/Cups06.jpg" },
    42: { name: "圣杯七", name_en: "Seven_of_Cups", img: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Cups07.jpg" },
    43: { name: "圣杯八", name_en: "Eight_of_Cups", img: "https://upload.wikimedia.org/wikipedia/commons/6/60/Cups08.jpg" },
    44: { name: "圣杯九", name_en: "Nine_of_Cups", img: "https://upload.wikimedia.org/wikipedia/commons/2/24/Cups09.jpg" },
    45: { name: "圣杯十", name_en: "Ten_of_Cups", img: "https://upload.wikimedia.org/wikipedia/commons/8/84/Cups10.jpg" },
    46: { name: "圣杯侍者", name_en: "Page_of_Cups", img: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Cups11.jpg" },
    47: { name: "圣杯骑士", name_en: "Knight_of_Cups", img: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Cups12.jpg" },
    48: { name: "圣杯皇后", name_en: "Queen_of_Cups", img: "https://upload.wikimedia.org/wikipedia/commons/6/62/Cups13.jpg" },
    49: { name: "圣杯国王", name_en: "King_of_Cups", img: "https://upload.wikimedia.org/wikipedia/commons/0/04/Cups14.jpg" }
  },

  // 宝剑 (Swords) - Rider-Waite 完整尺寸
  swords: {
    50: { name: "宝剑Ace", name_en: "Ace_of_Swords", img: "https://upload.wikimedia.org/wikipedia/commons/1a/Swords01.jpg" },
    51: { name: "宝剑二", name_en: "Two_of_Swords", img: "https://upload.wikimedia.org/wikipedia/commons/9/e/Swords02.jpg" },
    52: { name: "宝剑三", name_en: "Three_of_Swords", img: "https://upload.wikimedia.org/wikipedia/commons/0/2/Swords03.jpg" },
    53: { name: "宝剑四", name_en: "Four_of_Swords", img: "https://upload.wikimedia.org/wikipedia/commons/b/f/Swords04.jpg" },
    54: { name: "宝剑五", name_en: "Five_of_Swords", img: "https://upload.wikimedia.org/wikipedia/commons/2/3/Swords05.jpg" },
    55: { name: "宝剑六", name_en: "Six_of_Swords", img: "https://upload.wikimedia.org/wikipedia/commons/2/9/Swords06.jpg" },
    56: { name: "宝剑七", name_en: "Seven_of_Swords", img: "https://upload.wikimedia.org/wikipedia/commons/3/4/Swords07.jpg" },
    57: { name: "宝剑八", name_en: "Eight_of_Swords", img: "https://upload.wikimedia.org/wikipedia/commons/a/7/Swords08.jpg" },
    58: { name: "宝剑九", name_en: "Nine_of_Swords", img: "https://upload.wikimedia.org/wikipedia/commons/2/f/Swords09.jpg" },
    59: { name: "宝剑十", name_en: "Ten_of_Swords", img: "https://upload.wikimedia.org/wikipedia/commons/d/4/Swords10.jpg" },
    60: { name: "宝剑侍者", name_en: "Page_of_Swords", img: "https://upload.wikimedia.org/wikipedia/commons/4/c/Swords11.jpg" },
    61: { name: "宝剑骑士", name_en: "Knight_of_Swords", img: "https://upload.wikimedia.org/wikipedia/commons/b/0/Swords12.jpg" },
    62: { name: "宝剑皇后", name_en: "Queen_of_Swords", img: "https://upload.wikimedia.org/wikipedia/commons/d/4/Swords13.jpg" },
    63: { name: "宝剑国王", name_en: "King_of_Swords", img: "https://upload.wikimedia.org/wikipedia/commons/3/3/Swords14.jpg" }
  },

  // 星币 (Pentacles) - Rider-Waite 完整尺寸
  pentacles: {
    64: { name: "星币Ace", name_en: "Ace_of_Pentacles", img: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Pents01.jpg" },
    65: { name: "星币二", name_en: "Two_of_Pentacles", img: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Pents02.jpg" },
    66: { name: "星币三", name_en: "Three_of_Pentacles", img: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Pents03.jpg" },
    67: { name: "星币四", name_en: "Four_of_Pentacles", img: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Pents04.jpg" },
    68: { name: "星币五", name_en: "Five_of_Pentacles", img: "https://upload.wikimedia.org/wikipedia/commons/5/53/Pents05.jpg" },
    69: { name: "星币六", name_en: "Six_of_Pentacles", img: "https://upload.wikimedia.org/wikipedia/commons/1/18/Pents06.jpg" },
    70: { name: "星币七", name_en: "Seven_of_Pentacles", img: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Pents07.jpg" },
    71: { name: "星币八", name_en: "Eight_of_Pentacles", img: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Pents08.jpg" },
    72: { name: "星币九", name_en: "Nine_of_Pentacles", img: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Pents09.jpg" },
    73: { name: "星币十", name_en: "Ten_of_Pentacles", img: "https://upload.wikimedia.org/wikipedia/commons/2/26/Pents10.jpg" },
    74: { name: "星币侍者", name_en: "Page_of_Pentacles", img: "https://upload.wikimedia.org/wikipedia/commons/7/79/Pents11.jpg" },
    75: { name: "星币骑士", name_en: "Knight_of_Pentacles", img: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Pents12.jpg" },
    76: { name: "星币皇后", name_en: "Queen_of_Pentacles", img: "https://upload.wikimedia.org/wikipedia/commons/6/60/Pents13.jpg" },
    77: { name: "星币国王", name_en: "King_of_Pentacles", img: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Pents14.jpg" }
  }
};

// 获取所有图片
function getAllCardImages() {
  return {
    ...tarotImages.majorArcana,
    ...tarotImages.wands,
    ...tarotImages.cups,
    ...tarotImages.swords,
    ...tarotImages.pentacles
  };
}

// 获取单张牌图片
function getCardImage(cardId) {
  const all = getAllCardImages();
  return all[cardId] || null;
}

// 获取牌背面图片 - 使用本地SVG
const cardBackImage = "/assets/cards/card_back.svg";

module.exports = {
  tarotImages,
  getAllCardImages,
  getCardImage,
  cardBackImage
};
