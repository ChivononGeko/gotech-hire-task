import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('register')
	async register(@Body() dto: RegisterDto) {
		return this.authService.register(dto.username, dto.password)
	}

	@Post('login')
	async login(@Body() dto: LoginDto) {
		const result = await this.authService.login(dto.username, dto.password)
		if (!result) {
			throw new UnauthorizedException('Invalid credentials')
		}
		return result
	}
}
