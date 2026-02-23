export type DisclaimerType = 'basic' | 'report' | 'psychological';
export type DisclaimerSeverity = 'low' | 'medium' | 'high';

export interface DisclaimerContent {
  title: string;
  content: string;
  severity: DisclaimerSeverity;
  buttons?: Array<{ label: string; primary: boolean }>;
  requiresCheck?: boolean;
  professionalHelp?: {
    hotline: string;
    label: string;
  };
}

export const DISCLAIMER_CONTENT: Record<DisclaimerType, DisclaimerContent> = {
  basic: {
    title: '免责声明',
    content: '此分析仅供参考，不替代专业心理咨询。',
    severity: 'low'
  },
  report: {
    title: '⚠️ 重要提示',
    content: `本报告由 AI 自动生成，仅供参考。
- 不替代专业心理咨询或医学诊断
- 结论基于您提供的内容，可能不完整
- 如有心理困扰，建议咨询专业心理医生`,
    severity: 'medium',
    buttons: [
      { label: '我已知悉，继续查看', primary: true },
      { label: '了解更多', primary: false }
    ]
  },
  psychological: {
    title: '🧠 深度心理分析',
    content: `您即将查看深度心理分析报告

⚠️ 重要提醒：
• 本分析基于 AI 算法，仅供参考
• 不替代专业心理治疗或诊断
• 如有严重心理困扰，请寻求专业帮助
• 您的记录将被用于生成此分析

本分析可能涉及：
• 潜在心理模式识别
• 行为诱因分析
• 可能的成长建议

如感到不适，请立即停止查看并寻求专业支持。`,
    severity: 'high',
    requiresCheck: true,
    professionalHelp: {
      hotline: '400-161-9995',
      label: '全国心理援助热线'
    }
  }
};

export interface HelpResource {
  name: string;
  phone: string;
  available: string;
}

export const PROFESSIONAL_HELP_RESOURCES: HelpResource[] = [
  { name: '全国心理援助热线', phone: '400-161-9995', available: '24小时' },
  { name: '生命热线', phone: '400-821-1215', available: '24小时' },
  { name: '北京心理危机研究与干预中心', phone: '010-82951332', available: '24小时' }
];

export const DISCLAIMER_STORAGE_KEY = 'disclaimer_accepted';
export const PSYCHOLOGICAL_DISCLAIMER_KEY = 'psychological_disclaimer_shown';

export function hasAcceptedDisclaimer(type: DisclaimerType): boolean {
  const key = `${DISCLAIMER_STORAGE_KEY}_${type}`;
  return localStorage.getItem(key) === 'true';
}

export function setDisclaimerAccepted(type: DisclaimerType): void {
  const key = `${DISCLAIMER_STORAGE_KEY}_${type}`;
  localStorage.setItem(key, 'true');
}

export function hasAcceptedPsychologicalDisclaimer(): boolean {
  return localStorage.getItem(PSYCHOLOGICAL_DISCLAIMER_KEY) === 'true';
}

export function setPsychologicalDisclaimerAccepted(): void {
  localStorage.setItem(PSYCHOLOGICAL_DISCLAIMER_KEY, 'true');
}
