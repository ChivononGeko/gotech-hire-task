import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
	OnGatewayConnection,
	OnGatewayDisconnect,
	WsException,
} from '@nestjs/websockets'
import {
	JoinRoomPayload,
	SendMessagePayload,
	LeaveRoomPayload,
} from './dto/chat-event.interfaces'
import { Server, Socket } from 'socket.io'
import { ChatService } from './chat.service'
import { AuthService } from '../auth/auth.service'

const ROOM_PREFIX = 'room_'

function getRoomKey(roomId: number): string {
	return `${ROOM_PREFIX}${roomId}`
}

@WebSocketGateway({
	cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server

	constructor(
		private chatService: ChatService,
		private authService: AuthService,
	) {}

	handleConnection(client: Socket) {
		const token = client.handshake.auth?.token as string | undefined
		const payload = token ? this.authService.verifyToken(token) : null

		if (!payload) {
			client.disconnect()
			return
		}

		client.data.userId = payload.userId
		client.data.username = payload.username
	}

	handleDisconnect(_client: Socket) {}

	@SubscribeMessage('joinRoom')
	handleJoinRoom(
		@MessageBody() data: JoinRoomPayload,
		@ConnectedSocket() client: Socket,
	): void {
		if (!client.data.userId) {
			throw new WsException('Unauthorized')
		}
		client.join(getRoomKey(data.roomId))
	}

	@SubscribeMessage('sendMessage')
	async handleMessage(
		@MessageBody() data: SendMessagePayload,
		@ConnectedSocket() client: Socket,
	): Promise<void> {
		if (!client.data.userId) {
			throw new WsException('Unauthorized')
		}

		const { userId, username } = client.data as {
			userId: number
			username: string
		}
		const { roomId, content } = data

		const message = await this.chatService.saveMessage(
			roomId,
			userId,
			content,
			username,
		)

		this.server.to(getRoomKey(roomId)).emit('newMessage', {
			...message,
			username,
		})
	}

	@SubscribeMessage('leaveRoom')
	handleLeaveRoom(
		@MessageBody() data: LeaveRoomPayload,
		@ConnectedSocket() client: Socket,
	): void {
		client.leave(getRoomKey(data.roomId))
	}
}
