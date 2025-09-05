import { Component, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConversationService } from '../../services/conversation.service';

@Component({
  selector: 'app-message-list',
  imports: [CommonModule],
  template: `
    <div class="messages-wrapper">
      <div class="messages-container" #messagesContainer>
        @if (conversationService.messages().length === 0 && !conversationService.loading()) {
          <div class="empty-state">
            <p>Start a conversation by sending a message below.</p>
          </div>
        }
        
        @if (conversationService.loading()) {
          <div class="loading-state">
            <p>Loading messages...</p>
          </div>
        }
        
        @for (message of conversationService.messages(); track message.id) {
          <div class="message" [ngClass]="'message-' + message.role">
            <div class="message-content">
              {{ message.content }}
            </div>
            <div class="message-timestamp">
              {{ message.timestamp | date:'short' }}
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      height: 100%;
      display: block;
    }
    
    .messages-wrapper {
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      scroll-behavior: smooth;
      scrollbar-width: thin;
    }
    
    .messages-wrapper::-webkit-scrollbar {
      width: 6px;
    }
    
    .messages-wrapper::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    .messages-wrapper::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }
    
    .messages-wrapper::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
    
    .messages-container {
      padding: 1rem;
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .message {
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
    }
    
    .message-user {
      align-items: flex-end;
    }
    
    .message-user .message-content {
      background: #007ad9;
      color: white;
      margin-left: 25%;
    }
    
    .message-assistant {
      align-items: flex-start;
    }
    
    .message-assistant .message-content {
      background: #f8f9fa;
      color: #333;
      margin-right: 25%;
    }
    
    .message-content {
      padding: 0.75rem 1rem;
      border-radius: 18px;
      max-width: 75%;
      word-wrap: break-word;
    }
    
    .message-timestamp {
      font-size: 0.75rem;
      color: #6c757d;
      margin-top: 0.25rem;
      padding: 0 1rem;
    }
    
    .empty-state, .loading-state {
      text-align: center;
      color: #6c757d;
      margin-top: 2rem;
    }
  `]
})
export class MessageListComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(public conversationService: ConversationService) {}

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const wrapper = this.messagesContainer.nativeElement.parentElement;
        if (wrapper) {
          wrapper.scrollTop = wrapper.scrollHeight;
        }
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}