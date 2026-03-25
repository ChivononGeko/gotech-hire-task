import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
} from 'typeorm'

@Entity('rooms')
export class Room {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ unique: true })
	name: string

	@Column({ nullable: true })
	description: string

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date
}
