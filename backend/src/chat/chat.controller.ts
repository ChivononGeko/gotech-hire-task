import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	UseGuards,
	ParseIntPipe,
	Query,
} from '@nestjs/common'
import { ChatService } from './chat.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CreateRoomDto } from './dto/create-room.dto'

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
	constructor(private chatService: ChatService) {}

	@Get('rooms')
	async getRooms() {
		return this.chatService.getRooms()
	}

	@Post('rooms')
	async createRoom(@Body() dto: CreateRoomDto) {
		return this.chatService.createRoom(dto.name, dto.description)
	}

	@Get('rooms/:roomId/messages')
	async getMessages(
		@Param('roomId', ParseIntPipe) roomId: number,
		@Query('limit', new ParseIntPipe({ optional: true })) limit = 50,
		@Query('offset', new ParseIntPipe({ optional: true })) offset = 0,
	) {
		return this.chatService.getMessages(roomId, limit, offset)
	}
}
