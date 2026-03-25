import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	Index,
} from 'typeorm'
import { Exclude } from 'class-transformer'

// FIX [Code Quality]: заменили magic string 'user' на enum.
// Теперь все допустимые роли видны в одном месте и TypeScript проверяет их на этапе компиляции.
export enum UserRole {
	USER = 'user',
	ADMIN = 'admin',
}

@Entity('users')
export class User {
	@PrimaryGeneratedColumn()
	id: number

	// FIX [Performance]: добавили @Index() — login делает WHERE username = ? при каждом входе.
	// Без индекса каждый запрос делает full table scan по всей таблице users.
	@Index()
	@Column({ unique: true })
	username: string

	// FIX [Security]: @Exclude() предотвращает случайную утечку пароля
	// при сериализации через ClassSerializerInterceptor если он будет добавлен.
	@Exclude()
	@Column()
	password: string

	// FIX [Code Quality]: заменили тип string на enum UserRole.
	@Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
	role: UserRole

	// FIX [Code Quality]: добавили name: 'created_at' — унифицировали с snake_case в БД.
	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date
}
