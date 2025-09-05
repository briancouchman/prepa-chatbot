export interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface SendMessageRequest {
  content: string;
}

export interface SendMessageResponse {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  conversationId: string;
}