export interface Scene {
  id: string;
  originalText: string;
  imageUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  errorMsg?: string;
}

export interface CharacterProfile {
  name: string;
  description: string;
  imageBase64: string | null;
  mimeType: string | null;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
}
