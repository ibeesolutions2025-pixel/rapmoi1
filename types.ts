
export interface SceneEntry {
  time: string;
  lyrics: string;
  visualPrompt: string;
  setting: string;
  imageUrl?: string; // Each scene now gets its own generated image
}

export interface RapBlueprint {
  videoTitle: string;
  videoDescription: string;
  hashtags: string[];
  beatDescription: string;
  totalDuration: string;
  script: SceneEntry[];
}

export interface GenerationState {
  isGenerating: boolean;
  statusMessage: string;
  error: string | null;
  result: RapBlueprint | null;
}
