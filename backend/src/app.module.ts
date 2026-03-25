import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { ChatModule } from './chat/chat.module'
import { UsersModule } from './users/users.module'

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: process.env.DB_HOST,
			port: parseInt(process.env.DB_PORT ?? '5432', 10),
			username: process.env.DB_USERNAME,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			autoLoadEntities: true,
			synchronize: process.env.NODE_ENV !== 'production',
		}),
		AuthModule,
		ChatModule,
		UsersModule,
	],
})
export class AppModule {}
