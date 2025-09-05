import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConversationService } from '../../services/conversation.service';

@Component({
  selector: 'app-conversation-list',
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './conversation-list.component.html',
  styleUrl: './conversation-list.component.scss'
})
export class ConversationListComponent implements OnInit {
  constructor(public conversationService: ConversationService) {}

  ngOnInit(): void {
    console.log('ConversationListComponent initialized');
    console.log('Conversations on init:', this.conversationService.conversations());
    console.log('Loading state on init:', this.conversationService.loading());

    // Add a debug interval to monitor the conversations signal
    setInterval(() => {
      console.log('Current conversations:', this.conversationService.conversations());
    }, 2000);
  }

  createNewConversation(): void {
    console.log('UI: createNewConversation button clicked');
    console.log('UI: Current conversations before create:', this.conversationService.conversations().length);
    this.conversationService.createConversation();
  }

  selectConversation(conversationId: string): void {
    this.conversationService.setActiveConversation(conversationId);
  }

  deleteConversation(conversationId: string, event: Event): void {
    event.stopPropagation(); // Prevent triggering selectConversation
    console.log('UI: Delete conversation button clicked:', conversationId);

    if (confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      this.conversationService.deleteConversation(conversationId);
    }
  }
}
