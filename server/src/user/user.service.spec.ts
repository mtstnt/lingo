import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot({
          dialect: 'sqlite',
          storage: ':memory:',
          autoLoadModels: true,
          synchronize: true,
          logging: false,
          define: {
            underscored: true,
          },
        }),
        SequelizeModule.forFeature([User]),
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true, cascade: true });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const user = await service.create({
        email: 'create@test.com',
        password: 'hashedpass',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe('create@test.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      await service.create({
        email: 'find@test.com',
        password: 'hashedpass',
        firstName: 'John',
        lastName: 'Doe',
      });

      const found = await service.findByEmail('find@test.com');
      expect(found).toBeDefined();
      expect(found!.email).toBe('find@test.com');
    });

    it('should return null if user not found', async () => {
      const found = await service.findByEmail('nonexistent@test.com');
      expect(found).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const created = await service.create({
        email: 'byid@test.com',
        password: 'hashedpass',
        firstName: 'John',
        lastName: 'Doe',
      });

      const found = await service.findById(created.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(created.id);
    });

    it('should return null if user not found', async () => {
      const found = await service.findById(999);
      expect(found).toBeNull();
    });
  });

  describe('updateRefreshToken', () => {
    it('should update refresh token', async () => {
      const user = await service.create({
        email: 'token@test.com',
        password: 'hashedpass',
        firstName: 'John',
        lastName: 'Doe',
      });

      await service.updateRefreshToken(user.id, 'token123');

      const updated = await service.findById(user.id);
      expect(updated!.refreshToken).toBe('token123');
    });

    it('should clear refresh token when null', async () => {
      const user = await service.create({
        email: 'clear@test.com',
        password: 'hashedpass',
        firstName: 'John',
        lastName: 'Doe',
        refreshToken: 'oldtoken',
      });

      await service.updateRefreshToken(user.id, null);

      const updated = await service.findById(user.id);
      expect(updated!.refreshToken).toBeNull();
    });
  });
});
