import {
  type AuthenticatedUser,
  CurrentUser,
} from '@/shared/decorators/current-user.decorator';
import {
  Body,
  Controller,
  Get,
  ParseFilePipeBuilder,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { NotFoundError } from '@/shared/errors/not-found.error';
import { createDiskStorage } from '@/shared/storage/disk.storage';
import { UsersService } from '../services/users.service';
import { UpdateProfileDto } from '../dto/users-profile.dto';
import {
  ProfileResDto,
  UploadImageResDto,
  UserResDto,
} from '../dto/users-res-dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOkResponse({ type: UserResDto })
  async findById(@CurrentUser() user: AuthenticatedUser) {
    const userInfo = await this.usersService.findById(user.sub);

    if (!userInfo) throw new NotFoundError('User not found');

    const { profile, ...rest } = userInfo;

    return {
      ...rest,
      nickname: profile?.nickname ?? null,
      profile,
    };
  }

  @Get('me/profile')
  @ApiOkResponse({ type: ProfileResDto })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return await this.usersService.getProfileByUserId(user.sub);
  }

  @Patch('me/update-profile')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createDiskStorage('./uploads/profile'),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({ type: ProfileResDto })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /jpeg|png|webp/ })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({ fileIsRequired: false }),
    )
    file?: Express.Multer.File,
  ) {
    const updateDto = {
      userId: user.sub,
      ...updateProfileDto,
      file,
    };

    return this.usersService.updateProfile({
      updateDto,
    });
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: createDiskStorage('./uploads/profile'),
    }),
  )
  @Post('me/profile/image')
  @ApiOkResponse({ type: UploadImageResDto })
  uploadProfileImage(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /jpeg|png|webp/ })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build(),
    )
    file: Express.Multer.File,
  ) {
    return this.usersService.uploadProfileImage(user.sub, file.path);
  }
}
