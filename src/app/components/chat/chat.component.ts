import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConversationListComponent } from '../conversation-list/conversation-list.component';
import { MessageListComponent } from '../message-list/message-list.component';
import { MessageInputComponent } from '../message-input/message-input.component';
import { ConversationService } from '../../services/conversation.service';

@Component({
  selector: 'app-chat',
  imports: [
    CommonModule,
    ConversationListComponent,
    MessageListComponent,
    MessageInputComponent
  ],
  template: `
    <div class="chat-container">
      <div class="sidebar">
        <app-conversation-list />
      </div>
      
      <div class="chat-area">
        @if (conversationService.activeConversation()) {
          <div class="chat-header">
            <h3>{{ conversationService.activeConversation()?.title || 'New Conversation' }}</h3>
          </div>
          
          <div class="messages-area">
            <app-message-list />
          </div>
          
          <app-message-input />
        } @else {
          <div class="no-conversation">
            <div class="no-conversation-content">
              <h3>Welcome to Chatbot Prepa</h3>
              <p>Select a conversation from the sidebar or create a new one to get started.</p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      height: 100vh;
    }
    
    .sidebar {
      width: 300px;
      border-right: 1px solid #e9ecef;
      background: #f8f9fa;
    }
    
    .chat-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: white;
    }
    
    .chat-header {
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
      background: white;
    }
    
    .chat-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: #333;
    }
    
    .messages-area {
      flex: 1;
      overflow: hidden;
    }
    
    .no-conversation {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
    }
    
    .no-conversation-content {
      text-align: center;
      color: #6c757d;
    }
    
    .no-conversation-content h3 {
      margin-bottom: 1rem;
      color: #333;
    }
  `]
})
export class ChatComponent {
  constructor(public conversationService: ConversationService) {}
}