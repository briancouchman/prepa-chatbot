import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { 
  Conversation, 
  CreateConversationRequest 
} from '../models/conversation.interface';
import { 
  Message, 
  SendMessageRequest 
} from '../models/message.interface';
import { ChatServiceInterface } from './chat.interface';

@Injectable({
  providedIn: 'root'
})
export class MockChatService implements ChatServiceInterface {
  private conversations: Conversation[] = [];
  private messages: Message[] = [];
  private nextConvId = 1;
  private nextMsgId = 1;

  createConversation(request: CreateConversationRequest = {}): Observable<Conversation> {
    const conversation: Conversation = {
      id: `conv_${this.nextConvId++}`,
      title: request.title || `Conversation ${this.nextConvId - 1}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.conversations.unshift(conversation);
    console.log('Mock: Created conversation:', conversation);
    
    return of(conversation).pipe(delay(300));
  }

  getConversations(): Observable<Conversation[]> {
    console.log('Mock: Getting conversations:', this.conversations);
    return of([...this.conversations]).pipe(delay(300));
  }

  sendMessage(conversationId: string, request: SendMessageRequest): Observable<Message> {
    // User message
    const userMessage: Message = {
      id: `msg_${this.nextMsgId++}`,
      conversationId,
      content: request.content,
      role: 'user',
      timestamp: new Date()
    };
    
    this.messages.push(userMessage);

    // Mock assistant response
    const assistantMessage: Message = {
      id: `msg_${this.nextMsgId++}`,
      conversationId,
      content: `Thanks for your message: "${request.content}". This is a mock response from the chatbot.`,
      role: 'assistant',
      timestamp: new Date(Date.now() + 1000) // 1 second later
    };
    
    // Add assistant response after a delay
    setTimeout(() => {
      this.messages.push(assistantMessage);
    }, 1500);

    console.log('Mock: Sent message:', userMessage);
    return of(userMessage).pipe(delay(300));
  }

  getConversation(conversationId: string): Observable<{conversation: Conversation, messages: Message[]}> {
    const conversation = this.conversations.find(conv => conv.id === conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    
    const conversationMessages = this.messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    console.log('Mock: Getting conversation:', conversationId, { conversation, messages: conversationMessages });
    return of({ conversation, messages: conversationMessages }).pipe(delay(300));
  }

  deleteConversation(conversationId: string): Observable<void> {
    this.conversations = this.conversations.filter(conv => conv.id !== conversationId);
    this.messages = this.messages.filter(msg => msg.conversationId !== conversationId);
    
    console.log('Mock: Deleted conversation:', conversationId);
    return of(void 0).pipe(delay(300));
  }
}