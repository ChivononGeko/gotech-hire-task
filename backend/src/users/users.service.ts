import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'

export interface SafeUser {
	id: number
	username: string
}

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {}

	async findAll(): Promise<SafeUser[]> {
		return this.userRepository.find({
			select: ['id', 'username'],
		})
	}
}
