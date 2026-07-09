import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

class HealthDto {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({ example: 'nookbox-server' })
  service: string;
}

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOkResponse({ type: HealthDto })
  health(): HealthDto {
    return { status: 'ok', service: 'nookbox-server' };
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
