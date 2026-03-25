import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
	Index,
} from 'typeorm'
import { User } from './user.entity'
import { Room } from './room.entity'

@Entity('messages')
export class Message {
	@PrimaryGeneratedColumn()
	id: number

	// FIX [Performance]: добавили @Index() — часто используется в WHERE roomId = ?
	// Без индекса каждый запрос сообщений делает full table scan по таблице messages.
	@Index()
	@Column({ name: 'room_id' })
	// FIX [Code Quality]: переименовали room_id → roomId (унифицировали в camelCase).
	// name: 'room_id' сохраняет имя колонки в БД неизменным — миграция не нужна.
	roomId: number

	@Index()
	@Column({ name: 'user_id' })
	// FIX [Code Quality]: переименовали user_id → userId.
	userId: number

	// FIX [Performance + Architecture]: добавили ManyToOne relation.
	// Без него TypeORM не может делать relations: ['user'] в find() —
	// именно это позволяет заменить N+1 цикл на один JOIN запрос.
	@ManyToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user: User

	@ManyToOne(() => Room)
	@JoinColumn({ name: 'room_id' })
	room: Room

	@Column('text')
	content: string

	// FIX [Code Quality]: добавили name: 'sender_name' — snake_case в БД, camelCase в коде.
	@Column({ nullable: true, name: 'sender_name' })
	senderName: string

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date
}
