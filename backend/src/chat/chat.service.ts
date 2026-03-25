import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Room } from '../users/entities/room.entity'
import { Message } from '../users/entities/message.entity'

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Room)
		private roomRepository: Repository<Room>,
		@InjectRepository(Message)
		private messageRepository: Repository<Message>,
	) {}

	async getRooms(): Promise<Room[]> {
		return this.roomRepository.find()
	}

	async createRoom(name: string, description?: string): Promise<Room> {
		const existing = await this.roomRepository.findOne({ where: { name } })
		if (existing) return existing
		const room = this.roomRepository.create({ name, description })
		return this.roomRepository.save(room)
	}

	async getMessages(
		roomId: number,
		limit: number,
		offset: number,
	): Promise<Message[]> {
		return this.messageRepository.find({
			where: { roomId },
			relations: ['user'],
			order: { createdAt: 'DESC' },
			take: limit,
			skip: offset,
		})
	}

	async saveMessage(
		roomId: number,
		userId: number,
		content: string,
		senderName: string,
	): Promise<Message> {
		const message = this.messageRepository.create({
			roomId,
			userId,
			content,
			senderName,
		})
		return this.messageRepository.save(message)
	}
}
