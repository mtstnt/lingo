import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { MaterialService } from './material.service';
import { Material } from './entities/material.entity';
import { User } from '../user/entities/user.entity';

describe('MaterialService', () => {
  let service: MaterialService;
  let module: TestingModule;
  let testUser: User;

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
        SequelizeModule.forFeature([Material, User]),
      ],
      providers: [MaterialService],
    }).compile();

    service = module.get<MaterialService>(MaterialService);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await Material.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });

    testUser = await User.create({
      email: 'test@test.com',
      password: 'hashedpass',
      firstName: 'Test',
      lastName: 'User',
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all materials for a user', async () => {
      await Material.create({
        resource_id: 1,
        user_id: testUser.id,
        name: 'Material 1',
        vocabulary: '[]',
        grammar: '[]',
        quiz: '[]',
      });
      await Material.create({
        resource_id: 2,
        user_id: testUser.id,
        name: 'Material 2',
        vocabulary: '[]',
        grammar: '[]',
        quiz: '[]',
      });

      const materials = await service.findAll(testUser.id);
      expect(materials).toHaveLength(2);
    });

    it('should not return materials from other users', async () => {
      const otherUser = await User.create({
        email: 'other@test.com',
        password: 'hashedpass',
        firstName: 'Other',
        lastName: 'User',
      });

      await Material.create({
        resource_id: 1,
        user_id: testUser.id,
        name: 'My material',
        vocabulary: '[]',
        grammar: '[]',
        quiz: '[]',
      });
      await Material.create({
        resource_id: 2,
        user_id: otherUser.id,
        name: 'Other material',
        vocabulary: '[]',
        grammar: '[]',
        quiz: '[]',
      });

      const materials = await service.findAll(testUser.id);
      expect(materials).toHaveLength(1);
      expect(materials[0].name).toBe('My material');
    });

    it('should return empty array when no materials exist', async () => {
      const materials = await service.findAll(testUser.id);
      expect(materials).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should find a material by id and user_id', async () => {
      const created = await Material.create({
        resource_id: 1,
        user_id: testUser.id,
        name: 'My material',
        vocabulary: '[]',
        grammar: '[]',
        quiz: '[]',
      });

      const found = await service.findOne(created.id, testUser.id);
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe('My material');
    });

    it('should throw NotFoundException if material does not exist', async () => {
      await expect(service.findOne(999, testUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if material belongs to another user', async () => {
      const otherUser = await User.create({
        email: 'other@test.com',
        password: 'hashedpass',
        firstName: 'Other',
        lastName: 'User',
      });

      const created = await Material.create({
        resource_id: 1,
        user_id: otherUser.id,
        name: 'Other material',
        vocabulary: '[]',
        grammar: '[]',
        quiz: '[]',
      });

      await expect(service.findOne(created.id, testUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft-delete a material', async () => {
      const created = await Material.create({
        resource_id: 1,
        user_id: testUser.id,
        name: 'To delete',
        vocabulary: '[]',
        grammar: '[]',
        quiz: '[]',
      });

      await service.remove(created.id, testUser.id);

      const materials = await service.findAll(testUser.id);
      expect(materials).toHaveLength(0);
    });

    it('should throw NotFoundException when deleting non-existent material', async () => {
      await expect(service.remove(999, testUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw NotFoundException when deleting another user's material", async () => {
      const otherUser = await User.create({
        email: 'other@test.com',
        password: 'hashedpass',
        firstName: 'Other',
        lastName: 'User',
      });

      const created = await Material.create({
        resource_id: 1,
        user_id: otherUser.id,
        name: 'Other material',
        vocabulary: '[]',
        grammar: '[]',
        quiz: '[]',
      });

      await expect(service.remove(created.id, testUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
