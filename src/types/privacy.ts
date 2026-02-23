export enum DataLevel {
  PUBLIC = 0,
  SENSITIVE = 1,
  CONFIDENTIAL = 2,
  SECRET = 3
}

export interface StorageSettings {
  cloudSync: boolean;
  localOnly: boolean;
  encryption: boolean;
  encryptionKey?: string;
}

export interface AIAnalysisSettings {
  enabled: boolean;
  basic: boolean;
  advanced: boolean;
  deep: boolean;
  consent: boolean;
  consentDate?: string;
}

export interface SharingSettings {
  anonymousInsights: boolean;
  researchParticipation: boolean;
}

export interface RightsSettings {
  exportEnabled: boolean;
  deleteEnabled: boolean;
  retentionDays: number;
}

export interface PrivacySettings {
  storage: StorageSettings;
  aiAnalysis: AIAnalysisSettings;
  sharing: SharingSettings;
  rights: RightsSettings;
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  storage: {
    cloudSync: true,
    localOnly: false,
    encryption: true
  },
  aiAnalysis: {
    enabled: true,
    basic: true,
    advanced: false,
    deep: false,
    consent: false
  },
  sharing: {
    anonymousInsights: false,
    researchParticipation: false
  },
  rights: {
    exportEnabled: true,
    deleteEnabled: true,
    retentionDays: 365
  }
};
