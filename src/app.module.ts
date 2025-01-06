import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChatService } from './chat/chat.service';
import { ChatModule } from './chat/chat.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, ChatModule],
  providers: [ChatService],
})
export class AppModule {}
