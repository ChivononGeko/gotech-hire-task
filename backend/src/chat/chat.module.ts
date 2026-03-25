import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChatService } from './chat.service'
import { ChatController } from './chat.controller'
import { ChatGateway } from './chat.gateway'
import { Room } from '../users/entities/room.entity'
import { Message } from '../users/entities/message.entity'
import { AuthModule } from '../auth/auth.module'

@Module({
	imports: [TypeOrmModule.forFeature([Room, Message]), AuthModule],
	controllers: [ChatController],
	providers: [ChatService, ChatGateway],
})
export class ChatModule {}
