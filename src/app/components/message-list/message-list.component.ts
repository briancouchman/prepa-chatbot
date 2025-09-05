import { Component, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConversationService } from '../../services/conversation.service';
import { MessageFormatterService } from '../../services/message-formatter.service';

@Component({
  selector: 'app-message-list',
  imports: [CommonModule],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss'
})
export class MessageListComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(
    public conversationService: ConversationService,
    public messageFormatter: MessageFormatterService
  ) {}

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