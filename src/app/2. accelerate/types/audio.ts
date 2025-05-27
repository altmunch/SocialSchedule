// Types for Audio Trend Service
export interface Sound {
  sound_id: string;
  url: string;
  velocity: number;
  bpm?: number | null;
  mood?: string | null;
  isCopyrightSafe?: boolean;
  [key: string]: any; // For additional properties
}

export interface AudioAnalysisResult {
  bpm: number | null;
  mood: string | null;
  isCopyrightSafe: boolean;
}

export interface AudioClient {
  getTrendingSounds(platform: string): Promise<Sound[]>;
}

export interface LibrosaClient {
  load(audioPath: string): Promise<Float32Array>;
  beatsBpm(audioData: Float32Array, sampleRate: number): Promise<number>;
}

export interface MoodPrediction {
  mood: string;
  confidence: number;
}

export interface CNNModel {
  predict(audioData: Float32Array): Promise<MoodPrediction>;
}

export interface ShazamClient {
  recognize(audioUrl: string): Promise<{ isCopyrighted: boolean }>;
}
