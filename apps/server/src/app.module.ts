import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { UsersModule } from './modules/users/users.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [DbModule, SharedModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
