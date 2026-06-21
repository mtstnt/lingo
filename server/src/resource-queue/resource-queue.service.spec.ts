import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { ResourceQueueService } from './resource-queue.service';
import { ResourceQueue } from './entities/resource-queue.entity';
import { ResourceQueueLog } from './entities/resource-queue-log.entity';
import { Resource } from '../resource/entities/resource.entity';
import { Material } from '../material/entities/material.entity';
import { User } from '../user/entities/user.entity';

describe('ResourceQueueService', () => {
  let service: ResourceQueueService;
  let module: TestingModule;
  let testUser: User;
  let testResource: Resource;

  const mockQueue = {
    add: jest.fn().mockResolvedValue({}),
  };

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
        SequelizeModule.forFeature([
          ResourceQueue,
          ResourceQueueLog,
          Resource,
          Material,
          User,
        ]),
      ],
      providers: [
        ResourceQueueService,
        {
          provide: getQueueToken('resource-processing'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<ResourceQueueService>(ResourceQueueService);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await ResourceQueue.destroy({ where: {}, force: true });
    await ResourceQueueLog.destroy({ where: {}, force: true });
    await Resource.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });

    testUser = await User.create({
      email: 'test@test.com',
      password: 'hashedpass',
      firstName: 'Test',
      lastName: 'User',
    });

    testResource = await Resource.create({
      user_id: testUser.id,
      name: 'My vocab',
      type: 'text',
      content: 'Hello, goodbye',
    });

    mockQueue.add.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all queue entries for a user', async () => {
      await ResourceQueue.create({
        resource_id: testResource.id,
        user_id: testUser.id,
        status: 'pending',
        prompt: 'Test prompt',
      });

      const entries = await service.findAll(testUser.id);
      expect(entries).toHaveLength(1);
      expect(entries[0].resource_id).toBe(testResource.id);
    });

    it('should not return queue entries from other users', async () => {
      const otherUser = await User.create({
        email: 'other@test.com',
        password: 'hashedpass',
        firstName: 'Other',
        lastName: 'User',
      });

      await ResourceQueue.create({
        resource_id: testResource.id,
        user_id: testUser.id,
        status: 'pending',
        prompt: 'My prompt',
      });
      await ResourceQueue.create({
        resource_id: testResource.id,
        user_id: otherUser.id,
        status: 'pending',
        prompt: 'Other prompt',
      });

      const entries = await service.findAll(testUser.id);
      expect(entries).toHaveLength(1);
      expect(entries[0].user_id).toBe(testUser.id);
    });

    it('should return empty array when no entries exist', async () => {
      const entries = await service.findAll(testUser.id);
      expect(entries).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('should create a queue entry and add a Bull job', async () => {
      const entry = await service.create(testUser.id, {
        resource_id: testResource.id,
      });

      expect(entry).toBeDefined();
      expect(entry.resource_id).toBe(testResource.id);
      expect(entry.user_id).toBe(testUser.id);
      expect(entry.status).toBe('pending');
      expect(entry.prompt).toBeDefined();
      expect(entry.retry_count).toBe(0);
      expect(mockQueue.add).toHaveBeenCalledWith({
        resourceQueueId: entry.id,
      });
    });

    it('should throw NotFoundException if resource does not exist', async () => {
      await expect(
        service.create(testUser.id, {
          resource_id: 999,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if resource belongs to another user', async () => {
      const otherUser = await User.create({
        email: 'other@test.com',
        password: 'hashedpass',
        firstName: 'Other',
        lastName: 'User',
      });

      const otherResource = await Resource.create({
        user_id: otherUser.id,
        name: 'Other res',
        type: 'text',
        content: 'Theirs',
      });

      await expect(
        service.create(testUser.id, {
          resource_id: otherResource.id,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancel', () => {
    it('should cancel a queue entry', async () => {
      const entry = await ResourceQueue.create({
        resource_id: testResource.id,
        user_id: testUser.id,
        status: 'pending',
        prompt: 'Test prompt',
      });

      const canceled = await service.cancel(testUser.id, entry.id);
      expect(canceled.status).toBe('canceled');
    });

    it('should cancel associated open log entries', async () => {
      const entry = await ResourceQueue.create({
        resource_id: testResource.id,
        user_id: testUser.id,
        status: 'processing',
        prompt: 'Test prompt',
      });

      const logEntry = await ResourceQueueLog.create({
        resource_queue_id: entry.id,
        start_at: new Date(),
        status: 'failed',
      });

      await service.cancel(testUser.id, entry.id);

      await logEntry.reload();
      expect(logEntry.status).toBe('canceled');
      expect(logEntry.end_at).not.toBeNull();
    });

    it('should throw NotFoundException if entry does not exist', async () => {
      await expect(service.cancel(testUser.id, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if entry belongs to another user', async () => {
      const otherUser = await User.create({
        email: 'other@test.com',
        password: 'hashedpass',
        firstName: 'Other',
        lastName: 'User',
      });

      const entry = await ResourceQueue.create({
        resource_id: testResource.id,
        user_id: otherUser.id,
        status: 'pending',
        prompt: 'Test',
      });

      await expect(service.cancel(testUser.id, entry.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should find a queue entry by id and user_id', async () => {
      const entry = await ResourceQueue.create({
        resource_id: testResource.id,
        user_id: testUser.id,
        status: 'pending',
        prompt: 'Test',
      });

      const found = await service.findOne(entry.id, testUser.id);
      expect(found).toBeDefined();
      expect(found.id).toBe(entry.id);
    });

    it('should throw NotFoundException if entry does not exist', async () => {
      await expect(service.findOne(999, testUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if entry belongs to another user', async () => {
      const otherUser = await User.create({
        email: 'other@test.com',
        password: 'hashedpass',
        firstName: 'Other',
        lastName: 'User',
      });

      const entry = await ResourceQueue.create({
        resource_id: testResource.id,
        user_id: otherUser.id,
        status: 'pending',
        prompt: 'Test',
      });

      await expect(service.findOne(entry.id, testUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
