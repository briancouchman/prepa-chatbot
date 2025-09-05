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
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  constructor(public conversationService: ConversationService) {}
}