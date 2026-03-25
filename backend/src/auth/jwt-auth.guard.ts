import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { Request } from 'express'

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(private authService: AuthService) {}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request>()
		const authHeader = request.headers['authorization']

		if (!authHeader?.startsWith('Bearer ')) {
			throw new UnauthorizedException('Missing or invalid authorization header')
		}

		const token = authHeader.slice(7)
		const payload = this.authService.verifyToken(token)

		if (!payload) {
			throw new UnauthorizedException('Invalid or expired token')
		}

		;(request as any).user = payload
		return true
	}
}
