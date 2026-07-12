import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { DbModule } from '@/db/db.module';
import { UsersModule } from '@/modules/users/users.module';
import { BetterAuthGuard } from '@/shared/guards/better-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { SharedModule } from '@/shared/shared.module';

@Module({
  imports: [DbModule, SharedModule, UsersModule],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: BetterAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
