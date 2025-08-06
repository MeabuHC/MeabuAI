import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [DatabaseModule, AuthModule, UserModule, AiModule],
  controllers: [],
})
export class AppModule {}
