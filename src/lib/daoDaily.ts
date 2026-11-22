/**
 * 东方时令工具：连续记录天数、十二时辰、二十四节气。
 * 纯函数，不依赖 React，便于测试与复用。
 */

export type SeasonKey = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SolarTermInfo {
  name: string;
  season: SeasonKey;
  phrase: string;
  symbol: string;
}

export interface ShichenInfo {
  name: string;
  phrase: string;
  egg: string;
}

type SolarTermPoint = SolarTermInfo & { month: number; day: number };

/** 24 节气按公历日期升序排列（近似固定日期，误差不影响产品语义） */
const SOLAR_TERMS: SolarTermPoint[] = [
  { month: 1, day: 5, name: '小寒', season: 'winter', phrase: '雁北乡，鹊始巢', symbol: '寒' },
  { month: 1, day: 20, name: '大寒', season: 'winter', phrase: '鸡始乳，水泽腹坚', symbol: '藏' },
  { month: 2, day: 4, name: '立春', season: 'spring', phrase: '东风解冻，蛰虫始振', symbol: '生' },
  { month: 2, day: 19, name: '雨水', season: 'spring', phrase: '獭祭鱼，鸿雁来', symbol: '润' },
  { month: 3, day: 5, name: '惊蛰', season: 'spring', phrase: '桃始华，仓庚鸣', symbol: '醒' },
  { month: 3, day: 20, name: '春分', season: 'spring', phrase: '玄鸟至，雷乃发声', symbol: '分' },
  { month: 4, day: 4, name: '清明', season: 'spring', phrase: '桐始华，虹始见', symbol: '清' },
  { month: 4, day: 20, name: '谷雨', season: 'spring', phrase: '萍始生，鸣鸠拂羽', symbol: '雨' },
  { month: 5, day: 5, name: '立夏', season: 'summer', phrase: '蝼蝈鸣，蚯蚓出', symbol: '长' },
  { month: 5, day: 21, name: '小满', season: 'summer', phrase: '苦菜秀，靡草死', symbol: '满' },
  { month: 6, day: 5, name: '芒种', season: 'summer', phrase: '螳螂生，鵙始鸣', symbol: '忙' },
  { month: 6, day: 21, name: '夏至', season: 'summer', phrase: '鹿角解，蝉始鸣', symbol: '至' },
  { month: 7, day: 7, name: '小暑', season: 'summer', phrase: '温风至，蟋蟀居宇', symbol: '暑' },
  { month: 7, day: 22, name: '大暑', season: 'summer', phrase: '腐草为萤，土润溽暑', symbol: '炎' },
  { month: 8, day: 7, name: '立秋', season: 'autumn', phrase: '凉风至，白露降', symbol: '秋' },
  { month: 8, day: 23, name: '处暑', season: 'autumn', phrase: '鹰乃祭鸟，天地始肃', symbol: '敛' },
  { month: 9, day: 7, name: '白露', season: 'autumn', phrase: '鸿雁来，玄鸟归', symbol: '露' },
  { month: 9, day: 22, name: '秋分', season: 'autumn', phrase: '雷始收声，蛰虫坯户', symbol: '平' },
  { month: 10, day: 8, name: '寒露', season: 'autumn', phrase: '鸿雁来宾，菊有黄华', symbol: '凉' },
  { month: 10, day: 23, name: '霜降', season: 'autumn', phrase: '豺乃祭兽，草木黄落', symbol: '霜' },
  { month: 11, day: 7, name: '立冬', season: 'winter', phrase: '水始冰，地始冻', symbol: '始' },
  { month: 11, day: 22, name: '小雪', season: 'winter', phrase: '虹藏不见，天气上升', symbol: '雪' },
  { month: 12, day: 7, name: '大雪', season: 'winter', phrase: '鹖鴠不鸣，虎始交', symbol: '寂' },
  { month: 12, day: 21, name: '冬至', season: 'winter', phrase: '蚯蚓结，麋角解', symbol: '复' },
];

/** 返回当前节气（1 月 5 日前仍属上一个节气「冬至」） */
export function getSolarTerm(date: Date = new Date()): SolarTermInfo {
  const md = (date.getMonth() + 1) * 100 + date.getDate();
  let term = SOLAR_TERMS[SOLAR_TERMS.length - 1];

  if (md < 105) {
    term = SOLAR_TERMS.find(t => t.name === '冬至')!;
  } else {
    for (const candidate of SOLAR_TERMS) {
      if (candidate.month * 100 + candidate.day <= md) term = candidate;
    }
  }

  const { name, season, phrase, symbol } = term;
  return { name, season, phrase, symbol };
}

type ShichenPoint = { start: number; name: string; phrase: string; eggs: string[] };

/** 十二时辰，按起始小时升序 */
const SHICHEN: ShichenPoint[] = [
  { start: 23, name: '子时', phrase: '夜半 · 一阳初动', eggs: ['宜早眠，养一缕清净', '宜静思，不与夜色争'] },
  { start: 1, name: '丑时', phrase: '鸡鸣 · 万籁俱寂', eggs: ['宜安睡，蓄养精神', '宜放下，明日再思'] },
  { start: 3, name: '寅时', phrase: '平旦 · 天地将明', eggs: ['宜静卧，听第一声鸟鸣', '宜深呼吸，迎一线天光'] },
  { start: 5, name: '卯时', phrase: '日出 · 阳气初升', eggs: ['宜起身，沐晨光', '宜记一笔，为今日定心'] },
  { start: 7, name: '辰时', phrase: '食时 · 朝食宜早', eggs: ['宜好好吃一顿早饭', '宜缓缓开始，不急于赶路'] },
  { start: 9, name: '巳时', phrase: '隅中 · 精神最旺', eggs: ['宜专注，做要紧的事', '宜起身走动，舒展筋骨'] },
  { start: 11, name: '午时', phrase: '日中 · 阳极阴生', eggs: ['宜小憩片刻，闭目养神', '宜慢食细嚼，善待脾胃'] },
  { start: 13, name: '未时', phrase: '日昳 · 日影西斜', eggs: ['宜温一杯茶，续上心气', '宜整理手边，清出余地'] },
  { start: 15, name: '申时', phrase: '哺时 · 气血归于膀胱', eggs: ['宜远眺，让眼睛歇一歇', '宜写下此刻的小确幸'] },
  { start: 17, name: '酉时', phrase: '日入 · 日落而息', eggs: ['宜收拢心绪，缓缓归家', '宜感恩今日的一个人'] },
  { start: 19, name: '戌时', phrase: '黄昏 · 华灯初上', eggs: ['宜陪伴，说几句闲话', '宜记录，留住今日的暖'] },
  { start: 21, name: '亥时', phrase: '人定 · 百脉通融', eggs: ['宜泡脚，早些安歇', '宜放下手机，与自己相处'] },
];

/** 时辰彩蛋按日期取模，同一天固定、每天更换，避免 render 期随机跳变 */
export function getShichen(date: Date = new Date()): ShichenInfo {
  const hour = date.getHours();
  let point = SHICHEN[0];
  for (const candidate of SHICHEN) {
    if (candidate.start <= hour) point = candidate;
  }

  const dayIndex = Math.floor(
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86400000
  );
  const egg = point.eggs[Math.abs(dayIndex) % point.eggs.length];
  return { name: point.name, phrase: point.phrase, egg };
}

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/** 连续记录天数：今天未记录时从昨天起算（今天还没结束，不算中断） */
export function getJournalStreak(timestamps: string[], now: Date = new Date()): number {
  const days = new Set(timestamps.map(ts => localDateKey(new Date(ts))));
  if (days.size === 0) return 0;

  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** 成就徽章阶梯 */
export const STREAK_BADGES = [
  { days: 3, name: '初醒', hint: '三日不辍' },
  { days: 7, name: '持恒', hint: '七日成习' },
  { days: 30, name: '静定', hint: '三十日如一日' },
] as const;
