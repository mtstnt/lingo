import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { Resource } from './entities/resource.entity';
import { User } from '../user/entities/user.entity';

describe('ResourceService', () => {
  let service: ResourceService;
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
        }),
        SequelizeModule.forFeature([Resource, User]),
      ],
      providers: [ResourceService],
    }).compile();

    service = module.get<ResourceService>(ResourceService);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await Resource.destroy({ where: {}, force: true });
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

  describe('create', () => {
    it('should create a resource', async () => {
      const resource = await service.create(testUser.id, {
        name: 'My vocab',
        type: 'text',
        content: 'Hello, goodbye',
      });

      expect(resource).toBeDefined();
      expect(resource.id).toBeDefined();
      expect(resource.user_id).toBe(testUser.id);
      expect(resource.name).toBe('My vocab');
      expect(resource.type).toBe('text');
      expect(resource.content).toBe('Hello, goodbye');
    });
  });

  describe('findAll', () => {
    it('should return all resources for a user', async () => {
      await service.create(testUser.id, {
        name: 'Res 1',
        type: 'text',
        content: 'Content 1',
      });
      await service.create(testUser.id, {
        name: 'Res 2',
        type: 'url',
        content: 'https://example.com',
      });

      const resources = await service.findAll(testUser.id);
      expect(resources).toHaveLength(2);
    });

    it('should not return resources from other users', async () => {
      const otherUser = await User.create({
        email: 'other@test.com',
        password: 'hashedpass',
        firstName: 'Other',
        lastName: 'User',
      });

      await service.create(testUser.id, {
        name: 'My res',
        type: 'text',
        content: 'Mine',
      });
      await service.create(otherUser.id, {
        name: 'Other res',
        type: 'text',
        content: 'Theirs',
      });

      const resources = await service.findAll(testUser.id);
      expect(resources).toHaveLength(1);
      expect(resources[0].name).toBe('My res');
    });

    it('should return empty array when no resources exist', async () => {
      const resources = await service.findAll(testUser.id);
      expect(resources).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should find a resource by id and user_id', async () => {
      const created = await service.create(testUser.id, {
        name: 'My vocab',
        type: 'text',
        content: 'Hello',
      });

      const found = await service.findOne(created.id, testUser.id);
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe('My vocab');
    });

    it('should throw NotFoundException if resource does not exist', async () => {
      await expect(service.findOne(999, testUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if resource belongs to another user', async () => {
      const otherUser = await User.create({
        email: 'other@test.com',
        password: 'hashedpass',
        firstName: 'Other',
        lastName: 'User',
      });

      const created = await service.create(otherUser.id, {
        name: 'Other res',
        type: 'text',
        content: 'Theirs',
      });

      await expect(service.findOne(created.id, testUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a resource', async () => {
      const created = await service.create(testUser.id, {
        name: 'Original',
        type: 'text',
        content: 'Original content',
      });

      const updated = await service.update(created.id, testUser.id, {
        name: 'Updated',
        content: 'Updated content',
      });

      expect(updated.name).toBe('Updated');
      expect(updated.content).toBe('Updated content');
      expect(updated.type).toBe('text');
    });

    it('should throw NotFoundException when updating non-existent resource', async () => {
      await expect(
        service.update(999, testUser.id, { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException when updating another user's resource", async () => {
      const otherUser = await User.create({
        email: 'other@test.com',
        password: 'hashedpass',
        firstName: 'Other',
        lastName: 'User',
      });

      const created = await service.create(otherUser.id, {
        name: 'Other res',
        type: 'text',
        content: 'Theirs',
      });

      await expect(
        service.update(created.id, testUser.id, { name: 'Hacked' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft-delete a resource', async () => {
      const created = await service.create(testUser.id, {
        name: 'To delete',
        type: 'text',
        content: 'Delete me',
      });

      await service.remove(created.id, testUser.id);

      const resources = await service.findAll(testUser.id);
      expect(resources).toHaveLength(0);
    });

    it('should throw NotFoundException when deleting non-existent resource', async () => {
      await expect(service.remove(999, testUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw NotFoundException when deleting another user's resource", async () => {
      const otherUser = await User.create({
        email: 'other@test.com',
        password: 'hashedpass',
        firstName: 'Other',
        lastName: 'User',
      });

      const created = await service.create(otherUser.id, {
        name: 'Other res',
        type: 'text',
        content: 'Theirs',
      });

      await expect(service.remove(created.id, testUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
