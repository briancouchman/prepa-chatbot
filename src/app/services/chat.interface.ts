import { Observable } from 'rxjs';
import { Conversation, CreateConversationRequest } from '../models/conversation.interface';
import { Message, SendMessageRequest } from '../models/message.interface';

export interface ChatServiceInterface {
  createConversation(request?: CreateConversationRequest): Observable<Conversation>;
  getConversations(): Observable<Conversation[]>;
  getConversation(conversationId: string): Observable<{conversation: Conversation, messages: Message[]}>;
  sendMessage(conversationId: string, request: SendMessageRequest): Observable<Message>;
  deleteConversation(conversationId: string): Observable<void>;
}