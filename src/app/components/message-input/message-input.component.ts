import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConversationService } from '../../services/conversation.service';

@Component({
  selector: 'app-message-input',
  imports: [FormsModule, ButtonModule, InputTextModule],
  template: `
    <div class="message-input-container">
      <input 
        type="text" 
        pInputText 
        [(ngModel)]="messageContent"
        (keydown.enter)="sendMessage()"
        placeholder="Type your message..."
        [disabled]="!conversationService.activeConversation() || conversationService.loading()"
        class="message-input"
      />
      <p-button 
        icon="pi pi-send" 
        (onClick)="sendMessage()"
        [disabled]="!messageContent().trim() || !conversationService.activeConversation() || conversationService.loading()"
        class="send-button"
      />
    </div>
  `,
  styles: [`
    .message-input-container {
      display: flex;
      gap: 10px;
      padding: 1rem;
      background: white;
      border-top: 1px solid #e9ecef;
    }
    
    .message-input {
      flex: 1;
    }
    
    .send-button {
      min-width: 50px;
    }
  `]
})
export class MessageInputComponent {
  messageContent = signal('');

  constructor(public conversationService: ConversationService) {}

  sendMessage(): void {
    const content = this.messageContent().trim();
    if (content && this.conversationService.activeConversation()) {
      this.conversationService.sendMessage(content);
      this.messageContent.set('');
    }
  }
}