import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Conversation } from '../models/conversation.interface';
import { Message } from '../models/message.interface';
import { ChatService } from './chat.service';
import { MockChatService } from './mock-chat.service';
import { ChatServiceInterface } from './chat.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private conversationsSignal = signal<Conversation[]>([]);
  private activeConversationIdSignal = signal<string | null>(null);
  private messagesSignal = signal<Message[]>([]);
  private loadingSignal = signal(false);
  private sendingMessageSignal = signal(false);
  private waitingForResponseSignal = signal(false);
  
  private destroyRef = inject(DestroyRef);

  readonly conversations = this.conversationsSignal.asReadonly();
  readonly activeConversationId = this.activeConversationIdSignal.asReadonly();
  readonly messages = this.messagesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly sendingMessage = this.sendingMessageSignal.asReadonly();
  readonly waitingForResponse = this.waitingForResponseSignal.asReadonly();

  readonly activeConversation = computed(() => {
    const activeId = this.activeConversationIdSignal();
    return activeId
      ? this.conversationsSignal().find(conv => conv.id === activeId) || null
      : null;
  });

  private apiService: ChatServiceInterface;

  constructor(private chatService: ChatService, private mockChatService: MockChatService) {
    this.apiService = environment.useMockService ? this.mockChatService : this.chatService;
    this.setupNewMessageSubscription();
    this.loadConversations();
  }

  private setupNewMessageSubscription(): void {
    this.apiService.newMessage$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (newMessage) => {
          const activeId = this.activeConversationIdSignal();
          if (activeId && newMessage.conversationId === activeId) {
            this.messagesSignal.update(messages => [...messages, newMessage]);
            this.waitingForResponseSignal.set(false);
            console.log('New message added to UI:', newMessage);
          }
        },
        error: (error) => {
          console.error('Error receiving new message:', error);
          this.waitingForResponseSignal.set(false);
        }
      });
  }

  loadConversations(): void {
    console.log("loadConversations");
    this.loadingSignal.set(true);
    this.apiService.getConversations().subscribe({
      next: (conversations) => {
        console.log('Received conversations:', conversations);
        console.log('Conversations array length:', conversations.length);
        this.conversationsSignal.set(conversations);
        console.log('Signal value after set:', this.conversationsSignal());
        this.loadingSignal.set(false);
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
        this.loadingSignal.set(false);
      }
    });
  }

  createConversation(title?: string): void {
    console.log('createConversation called with title:', title);
    this.loadingSignal.set(true);
    
    console.log('Current conversations before create:', this.conversationsSignal().length);
    
    this.apiService.createConversation({ title }).subscribe({
      next: (conversation) => {
        console.log('createConversation API response:', conversation);
        
        if (conversation?.id) {
          console.log('Adding conversation to list:', conversation);
          
          // Update the conversations list
          this.conversationsSignal.update(conversations => {
            const newList = [conversation, ...conversations];
            console.log('Updated conversations list length:', newList.length);
            return newList;
          });
          
          console.log('Conversations after update:', this.conversationsSignal().length);
          console.log('Setting active conversation:', conversation.id);
          
          // Set as active conversation without loading messages (new conversation has no messages)
          this.activeConversationIdSignal.set(conversation.id);
          this.messagesSignal.set([]); // Clear messages for new conversation
        } else {
          console.error('Created conversation has no ID:', conversation);
        }
        this.loadingSignal.set(false);
      },
      error: (error) => {
        console.error('Error creating conversation:', error);
        this.loadingSignal.set(false);
      }
    });
  }

  setActiveConversation(conversationId: string): void {
    if (!conversationId) {
      console.error('Cannot set active conversation: ID is empty');
      return;
    }
    this.activeConversationIdSignal.set(conversationId);
    this.loadMessages(conversationId);
  }

  private loadMessages(conversationId: string): void {
    if (!conversationId) {
      console.error('Cannot load messages: conversation ID is empty');
      return;
    }

    this.loadingSignal.set(true);
    this.apiService.getConversation(conversationId).subscribe({
      next: (result: any) => {
        // Update the conversation in the list with latest data
        this.conversationsSignal.update(conversations => 
          conversations.map(conv => 
            conv.id === conversationId ? result.conversation : conv
          )
        );
        
        // Set messages
        this.messagesSignal.set(result.messages.sort((a: any, b: any) =>
          a.timestamp.getTime() - b.timestamp.getTime()
        ));
        this.loadingSignal.set(false);
      },
      error: (error: any) => {
        console.error('Error loading conversation:', error);
        this.messagesSignal.set([]); // Clear messages on error
        this.loadingSignal.set(false);
      }
    });
  }

  sendMessage(content: string): void {
    const activeId = this.activeConversationIdSignal();
    if (!activeId) return;

    // Create the user message immediately for UI
    const userMessage: Message = {
      id: `temp_${Date.now()}`, // Temporary ID
      conversationId: activeId,
      content: content,
      role: 'user',
      timestamp: new Date()
    };

    // Add user message to UI immediately
    this.messagesSignal.update(messages => [...messages, userMessage]);
    this.sendingMessageSignal.set(true);
    console.log('User message added to UI immediately:', userMessage);

    this.apiService.sendMessage(activeId, { content }).subscribe({
      next: (message) => {
        // Replace the temporary message with the real one from server
        this.messagesSignal.update(messages => 
          messages.map(msg => 
            msg.id === userMessage.id ? message : msg
          )
        );
        this.sendingMessageSignal.set(false);
        this.waitingForResponseSignal.set(true);
        console.log('User message confirmed by server, waiting for response:', message);
        
        // Safety timeout to stop waiting indicator if no response comes
        setTimeout(() => {
          if (this.waitingForResponseSignal()) {
            console.log('Response timeout, stopping wait indicator');
            this.waitingForResponseSignal.set(false);
          }
        }, 10000); // 10 second timeout
      },
      error: (error) => {
        console.error('Error sending message:', error);
        // Remove the temporary message on error
        this.messagesSignal.update(messages => 
          messages.filter(msg => msg.id !== userMessage.id)
        );
        this.sendingMessageSignal.set(false);
        this.waitingForResponseSignal.set(false);
      }
    });
  }

  deleteConversation(conversationId: string): void {
    console.log('Deleting conversation:', conversationId);
    this.loadingSignal.set(true);
    
    this.apiService.deleteConversation(conversationId).subscribe({
      next: () => {
        console.log('Conversation deleted successfully');
        
        // Remove conversation from the list
        this.conversationsSignal.update(conversations => 
          conversations.filter(conv => conv.id !== conversationId)
        );
        
        // If the deleted conversation was active, clear the active conversation
        if (this.activeConversationIdSignal() === conversationId) {
          this.activeConversationIdSignal.set(null);
          this.messagesSignal.set([]);
        }
        
        this.loadingSignal.set(false);
      },
      error: (error) => {
        console.error('Error deleting conversation:', error);
        this.loadingSignal.set(false);
      }
    });
  }
}
