import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConversationService } from '../../services/conversation.service';

@Component({
  selector: 'app-message-input',
  imports: [FormsModule, ButtonModule, InputTextModule],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss'
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