import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/entities/user.entity'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'

const BCRYPT_ROUNDS = 10
const JWT_EXPIRES_IN = '24h'

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {}

	private async hashPassword(password: string): Promise<string> {
		return bcrypt.hash(password, BCRYPT_ROUNDS)
	}

	private async comparePassword(
		password: string,
		hash: string,
	): Promise<boolean> {
		return bcrypt.compare(password, hash)
	}

	private get jwtSecret(): string {
		const secret = process.env.JWT_SECRET
		if (!secret) {
			throw new Error('JWT_SECRET is not defined in environment variables')
		}
		return secret
	}

	async register(
		username: string,
		password: string,
	): Promise<{ token: string; userId: number } | null> {
		const hashed = await this.hashPassword(password)
		const user = this.userRepository.create({ username, password: hashed })
		const saved = await this.userRepository.save(user)
		const token = jwt.sign({ userId: saved.id, username }, this.jwtSecret, {
			expiresIn: JWT_EXPIRES_IN,
		})
		return { token, userId: saved.id }
	}

	async login(
		username: string,
		password: string,
	): Promise<{ token: string; userId: number } | null> {
		const user = await this.userRepository.findOne({ where: { username } })
		if (!user) {
			return null
		}

		const isValid = await this.comparePassword(password, user.password)
		if (!isValid) {
			return null
		}

		const token = jwt.sign({ userId: user.id, username }, this.jwtSecret, {
			expiresIn: JWT_EXPIRES_IN,
		})
		return { token, userId: user.id }
	}

	verifyToken(token: string): { userId: number; username: string } | null {
		try {
			return jwt.verify(token, this.jwtSecret) as {
				userId: number
				username: string
			}
		} catch {
			return null
		}
	}
}
