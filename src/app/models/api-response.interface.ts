export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface ConversationListResponse {
  success: boolean;
  data: {
    conversations: Array<{
      id: string;
      title?: string;
      createdAt: string;
      updatedAt: string;
    }>;
  };
  timestamp?: string;
}

export interface ConversationMessagesResponse {
  success: boolean;
  data: {
    messages: Array<{
      id: string;
      content: string;
      role: 'user' | 'assistant';
      timestamp: string;
      conversationId: string;
    }>;
  };
  timestamp?: string;
}