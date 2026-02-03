
export interface Scene {
  id: string;
  title: string;
  objective: string;
  layout: string;
  interactions: string;
  references?: string; // Moved here per user request
}

export interface Storyboard {
  id: string;
  title: string;
  scenes: Scene[];
  createdAt: string;
  updatedAt: string;
  generatedSpec?: string | null;
  generatedAt?: string | null;
  techStack?: string;
  projectType?: string;
  // Global references removed in favor of scene-specific references
}