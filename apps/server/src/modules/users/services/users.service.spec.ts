import { DATABASE } from '@/db/db.service';
import { profiles } from '@/db/schema/profiles';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

type MockDb = {
  query: {
    users: { findFirst: jest.Mock };
    profiles: { findFirst: jest.Mock };
  };
  select: jest.Mock;
  limit: jest.Mock;
  insert: jest.Mock;
  values: jest.Mock;
  onConflictDoUpdate: jest.Mock;
};

function createMockDb(): MockDb {
  // updateProfile의 insert().values().onConflictDoUpdate() 체인 모킹
  const onConflictDoUpdate = jest.fn().mockResolvedValue(undefined);
  const values = jest.fn(() => ({ onConflictDoUpdate }));
  const insert = jest.fn(() => ({ values }));

  // findById의 select().from().leftJoin().where().limit() 체인 모킹
  const limit = jest.fn().mockResolvedValue([]);
  const selectWhere = jest.fn(() => ({ limit }));
  const leftJoin = jest.fn(() => ({ where: selectWhere }));
  const from = jest.fn(() => ({ leftJoin }));
  const select = jest.fn(() => ({ from }));

  return {
    query: {
      users: { findFirst: jest.fn() },
      profiles: { findFirst: jest.fn() },
    },
    select,
    limit,
    insert,
    values,
    onConflictDoUpdate,
  };
}

describe('UsersService', () => {
  let service: UsersService;
  let db: MockDb;

  beforeEach(async () => {
    db = createMockDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: DATABASE, useValue: db }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('유저가 없으면 null을 리턴한다.', async () => {
      db.limit.mockResolvedValue([]);

      const result = await service.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('유저가 있으면 프로필을 합친 유저를 반환한다.', async () => {
      db.limit.mockResolvedValue([
        {
          users: {
            id: 'user-1',
            name: 'tester',
            email: 'test@example.com',
            emailVerified: false,
          },
          profiles: { userId: 'user-1', nickname: 'nick' },
        },
      ]);

      const result = await service.findById('user-1');

      expect(result).toMatchObject({
        id: 'user-1',
        name: 'tester',
        email: 'test@example.com',
        profile: { userId: 'user-1', nickname: 'nick' },
      });
    });

    it('프로필이 없으면 profile은 null이다.', async () => {
      db.limit.mockResolvedValue([
        {
          users: { id: 'user-1', name: 'tester', email: 'test@example.com' },
          profiles: null,
        },
      ]);

      const result = await service.findById('user-1');

      expect(result).toMatchObject({ id: 'user-1', profile: null });
    });
  });

  describe('getProfileByUserId', () => {
    it('유저 프로필이 없으면 null을 반환한다.', async () => {
      db.query.profiles.findFirst.mockResolvedValue(undefined);

      const result = await service.getProfileByUserId('non-existent-id');

      expect(result).toBeNull();
    });

    it('유저 프로필이 있으면 프로필을 반환한다.', async () => {
      db.query.profiles.findFirst.mockResolvedValue({
        userId: 'user-1',
        nickname: 'tester',
      });

      const result = await service.getProfileByUserId('user-1');

      expect(result).toMatchObject({
        userId: 'user-1',
        nickname: 'tester',
      });
    });
  });

  describe('updateProfile', () => {
    it('닉네임을 upsert 하면 저장된 프로필을 반환한다.', async () => {
      db.query.profiles.findFirst.mockResolvedValue({
        userId: 'user-1',
        nickname: 'new-nick',
      });

      const result = await service.updateProfile({
        updateDto: { userId: 'user-1', nickname: 'new-nick' },
      });

      expect(db.insert).toHaveBeenCalledWith(profiles);
      expect(db.values).toHaveBeenCalledWith({
        userId: 'user-1',
        nickname: 'new-nick',
      });
      expect(db.onConflictDoUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          target: profiles.userId,
          set: expect.objectContaining({ nickname: 'new-nick' }),
        }),
      );
      expect(result).toMatchObject({ userId: 'user-1', nickname: 'new-nick' });
    });

    it('프로필 행이 없어도 새로 생성(insert)된다.', async () => {
      // 온보딩 신규 유저: 조회 시점엔 행이 없다가 upsert 후 생성된다.
      db.query.profiles.findFirst.mockResolvedValue({
        userId: 'user-1',
        nickname: 'first-nick',
      });

      const result = await service.updateProfile({
        updateDto: { userId: 'user-1', nickname: 'first-nick', bio: '' },
      });

      expect(db.insert).toHaveBeenCalledWith(profiles);
      expect(db.values).toHaveBeenCalledWith({
        userId: 'user-1',
        nickname: 'first-nick',
        bio: '',
      });
      expect(result).toMatchObject({
        userId: 'user-1',
        nickname: 'first-nick',
      });
    });

    it('파일이 있으면 이미지 경로가 저장된다.', async () => {
      db.query.profiles.findFirst.mockResolvedValue({
        userId: 'user-1',
        nickname: 'tester',
        image: '/uploads/profile/avatar.png',
      });

      const file = {
        path: 'uploads/profile/avatar.png',
      } as Express.Multer.File;

      const result = await service.updateProfile({
        updateDto: { userId: 'user-1', file },
      });

      expect(db.values).toHaveBeenCalledWith({
        userId: 'user-1',
        image: '/uploads/profile/avatar.png',
      });
      expect(db.onConflictDoUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          set: expect.objectContaining({
            image: '/uploads/profile/avatar.png',
          }),
        }),
      );
      expect(result).toMatchObject({
        userId: 'user-1',
        image: '/uploads/profile/avatar.png',
      });
    });
  });
});
