import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConversationService } from '../../services/conversation.service';

@Component({
  selector: 'app-conversation-list',
  imports: [CommonModule, ButtonModule, CardModule],
  template: `
    <div class="conversation-list">
      <div class="conversation-header">
        <h3>Conversations</h3>
        <p-button 
          icon="pi pi-plus" 
          label="New Chat"
          (onClick)="createNewConversation()"
          [loading]="conversationService.loading()"
          size="small"
        />
      </div>
      
      <div class="conversations">
        <!-- Debug info -->
        <div style="background: yellow; padding: 10px; margin: 10px;">
          <strong>DEBUG:</strong><br>
          Conversations count: {{ conversationService.conversations().length }}<br>
          Loading: {{ conversationService.loading() }}<br>
          Raw conversations: {{ conversationService.conversations() | json }}
        </div>
        
        @if (conversationService.loading() && conversationService.conversations().length === 0) {
          <div class="loading-state">
            <p>Loading conversations...</p>
          </div>
        }
        
        @if (conversationService.conversations().length === 0 && !conversationService.loading()) {
          <div class="empty-state">
            <p>No conversations yet. Create your first chat!</p>
          </div>
        }
        
        @for (conversation of conversationService.conversations(); track conversation.id) {
          <div 
            class="conversation-item" 
            [ngClass]="{ 'active': conversation.id === conversationService.activeConversationId() }"
          >
            <div class="conversation-content" (click)="selectConversation(conversation.id)">
              <div class="conversation-title">
                {{ conversation.title || 'New Conversation' }}
              </div>
              <div class="conversation-date">
                {{ conversation.updatedAt | date:'short' }}
              </div>
            </div>
            <div class="conversation-actions">
              <p-button 
                icon="pi pi-trash" 
                severity="danger"
                [text]="true"
                size="small"
                (onClick)="deleteConversation(conversation.id, $event)"
                [loading]="conversationService.loading()"
                class="delete-button"
              />
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .conversation-list {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #f8f9fa;
    }
    
    .conversation-header {
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
      background: white;
    }
    
    .conversation-header h3 {
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
    }
    
    .conversations {
      flex: 1;
      overflow-y: auto;
    }
    
    .conversation-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
      background: white;
      transition: background-color 0.2s;
    }
    
    .conversation-item:hover {
      background: #f8f9fa;
    }
    
    .conversation-item.active {
      background: #e3f2fd;
      border-left: 4px solid #007ad9;
    }
    
    .conversation-content {
      flex: 1;
      cursor: pointer;
      padding-right: 1rem;
    }
    
    .conversation-title {
      font-weight: 500;
      margin-bottom: 0.25rem;
      color: #333;
    }
    
    .conversation-date {
      font-size: 0.875rem;
      color: #6c757d;
    }
    
    .conversation-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .delete-button {
      opacity: 0.6;
      transition: opacity 0.2s;
    }
    
    .conversation-item:hover .delete-button {
      opacity: 1;
    }
    
    .empty-state, .loading-state {
      padding: 2rem 1rem;
      text-align: center;
      color: #6c757d;
    }
  `]
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