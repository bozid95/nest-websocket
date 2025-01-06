import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, roomId: string) {
    try {
      client.join(roomId);
      console.log(`Client ${client.id} joined room: ${roomId}`);
    } catch (error) {
      console.error(`Error joining room: ${roomId}`, error);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    payload: { chatRoomId: string; userId: string; content: string },
  ) {
    const { chatRoomId, userId, content } = payload;

    try {
      // Simpan pesan ke database menggunakan ChatService
      const message = await this.chatService.sendMessage(
        userId,
        chatRoomId,
        content,
      );

      this.server.to(chatRoomId).emit('newMessage', message);
    } catch (error) {
      console.error(`Error sending message to room: ${chatRoomId}`, error);
    }
  }
}
