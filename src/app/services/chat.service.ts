import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { 
  Conversation, 
  CreateConversationRequest, 
  CreateConversationResponse 
} from '../models/conversation.interface';
import { 
  Message, 
  SendMessageRequest, 
  SendMessageResponse 
} from '../models/message.interface';
import { 
  ConversationListResponse, 
  ConversationMessagesResponse 
} from '../models/api-response.interface';
import { ChatServiceInterface } from './chat.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatService implements ChatServiceInterface {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  private parseDate(dateString: string | undefined): Date {
    if (!dateString) return new Date();
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  createConversation(request: CreateConversationRequest = {}): Observable<Conversation> {
    return this.http.post<any>(
      `${this.baseUrl}/chat/conversations`, 
      request
    ).pipe(
      map(response => {
        console.log('Create conversation response:', response);
        
        // Handle nested response structure
        const conversationData = response.data || response;
        
        return {
          id: conversationData.id,
          title: conversationData.title || 'New Conversation',
          createdAt: this.parseDate(conversationData.createdAt),
          updatedAt: this.parseDate(conversationData.updatedAt)
        };
      })
    );
  }

  getConversations(): Observable<Conversation[]> {
    return this.http.get<ConversationListResponse | CreateConversationResponse[]>(
      `${this.baseUrl}/chat/conversations`
    ).pipe(
      map(response => {
        console.log('Get conversations raw response:', response);
        console.log('Response type:', typeof response);
        console.log('Is array:', Array.isArray(response));
        
        let conversations: any[] = [];
        
        if (Array.isArray(response)) {
          conversations = response;
        } else if (response && (response as any).data && (response as any).data.conversations) {
          // Handle nested structure: { success: true, data: { conversations: [...] } }
          conversations = (response as any).data.conversations;
        } else if (response && (response as any).conversations) {
          conversations = (response as any).conversations;
        } else if (response && typeof response === 'object') {
          // Handle case where API returns direct object
          console.log('Response is object, treating as single conversation or checking properties');
          console.log('Response keys:', Object.keys(response));
          conversations = [response];
        }
        
        console.log('Extracted conversations:', conversations);
        
        const mappedConversations = conversations.map(conv => {
          if (!conv.id) {
            console.warn('Conversation missing ID:', conv);
            return null;
          }
          return {
            id: conv.id,
            title: conv.title || 'New Conversation',
            createdAt: this.parseDate(conv.createdAt),
            updatedAt: this.parseDate(conv.updatedAt)
          };
        }).filter(conv => conv !== null);
        
        console.log('Final mapped conversations:', mappedConversations);
        return mappedConversations as Conversation[];
      })
    );
  }

  sendMessage(conversationId: string, request: SendMessageRequest): Observable<Message> {
    return this.http.post<any>(
      `${this.baseUrl}/chat/conversations/${conversationId}/messages`,
      request
    ).pipe(
      map(response => {
        console.log('Send message response:', response);
        
        // Handle nested response structure  
        const messageData = response.data || response;
        
        return {
          id: messageData.id,
          conversationId: messageData.conversationId || conversationId,
          content: messageData.content,
          role: messageData.role,
          timestamp: this.parseDate(messageData.timestamp)
        };
      })
    );
  }

  getConversation(conversationId: string): Observable<{conversation: Conversation, messages: Message[]}> {
    return this.http.get<any>(
      `${this.baseUrl}/chat/conversations/${conversationId}`
    ).pipe(
      map(response => {
        console.log('Get conversation response:', response);
        
        // Handle nested response structure
        const conversationData = response.data || response;
        
        // Extract conversation info
        const conversation: Conversation = {
          id: conversationData.id || conversationId,
          title: conversationData.title || 'New Conversation',
          createdAt: this.parseDate(conversationData.createdAt),
          updatedAt: this.parseDate(conversationData.updatedAt)
        };
        
        // Extract messages
        let messages: any[] = [];
        if (conversationData.messages && Array.isArray(conversationData.messages)) {
          messages = conversationData.messages;
        }
        
        const mappedMessages = messages.map((msg: any) => ({
          id: msg.id,
          conversationId: msg.conversationId || conversationId,
          content: msg.content,
          role: msg.role,
          timestamp: this.parseDate(msg.timestamp)
        }));
        
        return { conversation, messages: mappedMessages };
      })
    );
  }

  deleteConversation(conversationId: string): Observable<void> {
    return this.http.delete<any>(
      `${this.baseUrl}/chat/conversations/${conversationId}`
    ).pipe(
      map(response => {
        console.log('Delete conversation response:', response);
        return;
      })
    );
  }
}