import { type AuthenticatedUser } from '@/shared/decorators/current-user.decorator';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundError } from '@/shared/errors/not-found.error';
import { UsersService } from '../services/users.service';
import { UsersController } from './users.controller';
import { UpdateProfileDto } from '../dto/users-profile.dto';

describe('UsersController', () => {
  const mockUser: AuthenticatedUser = {
    id: 'saas',
    sub: 'saas',
    email: 'test@example.com',
    name: 'tester',
    image: '',
  };

  let controller: UsersController;

  const mockUsersService = {
    findById: jest.fn(),
    getProfileByUserId: jest.fn(),
    updateProfile: jest.fn(),
    uploadProfileImage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET: findById', () => {
    it('유저가 없으면 NotFoundException을 던져야 한다.', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(controller.findById(mockUser)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('유저가 있으면 프로필을 합쳐 닉네임과 함께 반환한다.', async () => {
      const profile = {
        userId: 'saas',
        nickname: 'nick',
        image: '/uploads/profile/a.png',
        bio: '안녕',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const dbUser = {
        id: 'saas',
        name: 'tester',
        email: 'test@example.com',
        emailVerified: true,
        image: '',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile,
      };
      mockUsersService.findById.mockResolvedValue(dbUser);

      const result = await controller.findById(mockUser);

      const { profile: _profile, ...userFields } = dbUser;
      expect(result).toEqual({
        ...userFields,
        nickname: 'nick',
        profile,
      });
    });

    it('프로필이 없으면 nickname과 profile은 null이다.', async () => {
      const dbUser = {
        id: 'saas',
        name: 'tester',
        email: 'test@example.com',
        emailVerified: true,
        image: '',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: null,
      };
      mockUsersService.findById.mockResolvedValue(dbUser);

      const result = await controller.findById(mockUser);

      expect(result).toMatchObject({ nickname: null, profile: null });
    });
  });

  describe('GET: getProfileByUserId', () => {
    it('getProfile은 userId를 인자로 서비스를 호출해야 한다.', async () => {
      mockUsersService.getProfileByUserId.mockResolvedValue(null);

      await controller.getProfile(mockUser);

      expect(mockUsersService.getProfileByUserId).toHaveBeenCalledWith(
        mockUser.sub,
      );
    });

    it('유저 프로필에 등록된게 없으면 usersService로부터 null을 반환받아야한다.', async () => {
      mockUsersService.getProfileByUserId.mockResolvedValue(null);

      const result = await controller.getProfile(mockUser);

      expect(result).toBeNull();
    });

    it('유저 프로필에 등록된게 있다면 유저의 프로필을 반환받아 리턴해야한다.', async () => {
      const userProfile = {
        userId: '2222',
        nickname: 'ewrwx',
        image: '',
        bio: '',
      };

      mockUsersService.getProfileByUserId.mockResolvedValue(userProfile);

      const result = await controller.getProfile(mockUser);

      expect(result).toEqual(userProfile);
    });
  });

  describe('PATCH: profileUpdate', () => {
    it('해당 유저의 프로필을 업데이트해야 한다.', async () => {
      const dto: UpdateProfileDto = { nickname: 'newNick', bio: '안녕' };
      const mockFile = {
        path: 'uploads/profile/123456-789.jpg',
      } as Express.Multer.File;

      const updated = {
        userId: mockUser.sub,
        nickname: 'newNick',
        bio: '안녕',
        image: '/uploads/profile/123456-789.jpg',
      };

      mockUsersService.updateProfile.mockResolvedValue(updated);

      const result = await controller.updateProfile(mockUser, dto, mockFile);

      expect(mockUsersService.updateProfile).toHaveBeenCalledWith({
        updateDto: { userId: mockUser.sub, ...dto, file: mockFile },
      });
      expect(result).toEqual(updated);
    });

    it('파일 없이 텍스트만 업데이트할 수 있어야 한다.', async () => {
      const dto: UpdateProfileDto = { nickname: 'newNick' };

      mockUsersService.updateProfile.mockResolvedValue({ ...dto, image: '' });

      await controller.updateProfile(mockUser, dto, undefined);

      expect(mockUsersService.updateProfile).toHaveBeenCalledWith({
        updateDto: { userId: mockUser.sub, ...dto, file: undefined },
      });
    });
  });

  describe('POST: uploadProfileImage', () => {
    const mockFile = {
      path: 'uploads/profile/123456-789.jpg',
    } as Express.Multer.File;

    it('userId와 file.path를 인자로 서비스를 호출해야 한다.', async () => {
      mockUsersService.uploadProfileImage.mockResolvedValue({
        imageUrl: '/uploads/profile/123456-789.jpg',
      });

      await controller.uploadProfileImage(mockUser, mockFile);

      expect(mockUsersService.uploadProfileImage).toHaveBeenCalledWith(
        mockUser.sub,
        mockFile.path,
      );
    });

    it('서비스가 반환한 imageUrl을 리턴해야 한다.', async () => {
      const expected = { imageUrl: '/uploads/profile/123456-789.jpg' };

      mockUsersService.uploadProfileImage.mockResolvedValue(expected);

      const result = await controller.uploadProfileImage(mockUser, mockFile);

      expect(result).toEqual(expected);
    });
  });
});
