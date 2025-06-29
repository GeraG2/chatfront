export interface ConfigData {
  GEMINI_MODEL: string;
  MAX_HISTORY_TURNS: number | string; // Use string for input flexibility, convert to number for API
  DEFAULT_SYSTEM_INSTRUCTION: string;
}

export interface NotificationState {
  message: string;
  type: 'success' | 'error';
}

// Types for Live Monitor
export interface HistoryPart {
  text: string;
}

export interface HistoryItem {
  role: 'user' | 'model';
  parts: HistoryPart[];
}

export interface SessionData {
  history: HistoryItem[];
  systemInstruction: string;
}

// Type for Product Catalog
export interface Product {
  id: string; // The backend should handle ID generation for new products
  name: string;
  description: string;
  price: number | string; // Use string for form input flexibility
  stock: number | string; // Use string for form input flexibility
}

// Type for AI Trainer
export interface TestPromptResponse {
    responseText: string;
}

export interface SessionListItem {
  id: string;
  platform: 'whatsapp' | 'messenger';
}