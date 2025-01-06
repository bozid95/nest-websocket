import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(userId: string, chatRoomId: string, content: string) {
    try {
      return await this.prisma.message.create({
        data: {
          content,
          userId,
          chatRoomId,
        },
        include: {
          user: { select: { id: true, username: true } },
        },
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}
