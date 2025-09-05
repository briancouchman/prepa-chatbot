export interface Conversation {
  id: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConversationRequest {
  title?: string;
}

export interface CreateConversationResponse {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
}