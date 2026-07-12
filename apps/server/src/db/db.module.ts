import { Global, Module } from '@nestjs/common';

import { db } from '@/db';
import { DATABASE } from '@/db/db.service';

// db 커넥션은 여기서만 런타임 import된다. @Global이라 모든 모듈에서 @Inject(DATABASE) 가능.
@Global()
@Module({
  providers: [{ provide: DATABASE, useValue: db }],
  exports: [DATABASE],
})
export class DbModule {}
