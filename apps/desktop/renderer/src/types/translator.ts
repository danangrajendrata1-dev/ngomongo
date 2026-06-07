export type TranslationLanguage = 'Indonesian' | 'English';

export type TranslationMode = 'Interview' | 'Meeting' | 'Discord' | 'Game' | 'Casual';

export type RealtimeConnectionState = 'idle' | 'ready' | 'processing' | 'paused' | 'error';

export type TranscriptMessage = {
  id: string;
  label: string;
  text: string;
};
