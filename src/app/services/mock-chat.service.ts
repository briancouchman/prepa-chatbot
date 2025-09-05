import { Injectable } from '@angular/core';
import { Observable, of, delay, Subject } from 'rxjs';
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

  private newMessageSubject = new Subject<Message>();
  public newMessage$ = this.newMessageSubject.asObservable();

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

    // Mock assistant response with markdown formatting
    const responses = [
      `Merci pour votre message : **"${request.content}"**. Voici une réponse formatée :

* Premier point important
* Deuxième élément à retenir
* Troisième aspect à considérer

Voici aussi une liste numérotée :

1. Première étape
2. Deuxième étape
3. Troisième étape finale

Et du code inline : \`console.log('Hello!')\`

*Texte en italique* et **texte en gras** pour l'emphase.`,

      `Excellente question ! Laissez-moi vous expliquer :

* **Avantages** :
  - Performance améliorée
  - Interface plus intuitive
  - Meilleure expérience utilisateur

* **Fonctionnalités** :
  - Temps réel avec RxJS
  - Formatage markdown
  - Interface responsive

Le code \`formatMessage()\` convertit automatiquement le markdown en HTML !`,

      `Voici un résumé structuré :

1. **Analyse** - Comprendre le problème
2. **Solution** - Implémenter la réponse
3. **Test** - Vérifier le fonctionnement

Points clés à retenir :
* Utilisation de \`Subject\` pour les événements
* Formatage *automatique* du contenu
* Interface **réactive** et moderne


`
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const assistantMessage: Message = {
      id: `msg_${this.nextMsgId++}`,
      conversationId,
      content: randomResponse,
      role: 'assistant',
      timestamp: new Date(Date.now() + 1000) // 1 second later
    };

    // Add assistant response after a delay and emit event
    setTimeout(() => {
      this.messages.push(assistantMessage);
      this.newMessageSubject.next(assistantMessage);
      console.log('Mock: Assistant response emitted:', assistantMessage);
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
