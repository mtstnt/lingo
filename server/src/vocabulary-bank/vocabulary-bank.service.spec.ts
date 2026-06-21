import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { VocabularyBankService } from './vocabulary-bank.service';
import { VocabularyBank } from './entities/vocabulary-bank.entity';
import { VocabularyBankReference } from './entities/vocabulary-bank-reference.entity';
import { VocabularyBankSentence } from './entities/vocabulary-bank-sentence.entity';
import { User } from '../user/entities/user.entity';

describe('VocabularyBankService', () => {
  let service: VocabularyBankService;
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
        SequelizeModule.forFeature([
          VocabularyBank,
          VocabularyBankReference,
          VocabularyBankSentence,
          User,
        ]),
      ],
      providers: [VocabularyBankService],
    }).compile();

    service = module.get<VocabularyBankService>(VocabularyBankService);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await VocabularyBankSentence.destroy({ where: {}, force: true });
    await VocabularyBankReference.destroy({ where: {}, force: true });
    await VocabularyBank.destroy({ where: {}, force: true });
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
    it('should return all vocabularies for a user', async () => {
      await service.create(testUser.id, {
        original_word: 'hello',
        pronunciation: 'həˈloʊ',
        meaning: '{"en":"greeting"}',
      });
      await service.create(testUser.id, {
        original_word: 'world',
        pronunciation: 'wɜːrld',
        meaning: '{"en":"earth"}',
      });

      const vocabularies = await service.findAll(testUser.id);
      expect(vocabularies).toHaveLength(2);
    });

    it('should not return vocabularies from other users', async () => {
      const otherUser = await User.create({
        email: 'other@test.com',
        password: 'hashedpass',
        firstName: 'Other',
        lastName: 'User',
      });

      await service.create(testUser.id, {
        original_word: 'hello',
        pronunciation: 'həˈloʊ',
        meaning: '{"en":"greeting"}',
      });
      await service.create(otherUser.id, {
        original_word: 'world',
        pronunciation: 'wɜːrld',
        meaning: '{"en":"earth"}',
      });

      const vocabularies = await service.findAll(testUser.id);
      expect(vocabularies).toHaveLength(1);
      expect(vocabularies[0].original_word).toBe('hello');
    });

    it('should return empty array when no vocabularies exist', async () => {
      const vocabularies = await service.findAll(testUser.id);
      expect(vocabularies).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should find a vocabulary by id and user_id', async () => {
      const created = await service.create(testUser.id, {
        original_word: 'hello',
        pronunciation: 'həˈloʊ',
        meaning: '{"en":"greeting"}',
      });

      const found = await service.findOne(created.id, testUser.id);
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.original_word).toBe('hello');
    });

    it('should throw NotFoundException if vocabulary does not exist', async () => {
      await expect(service.findOne(999, testUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if vocabulary belongs to another user', async () => {
      const otherUser = await User.create({
        email: 'other@test.com',
        password: 'hashedpass',
        firstName: 'Other',
        lastName: 'User',
      });

      const created = await service.create(otherUser.id, {
        original_word: 'hello',
        pronunciation: 'həˈloʊ',
        meaning: '{"en":"greeting"}',
      });

      await expect(service.findOne(created.id, testUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneWithRelations', () => {
    it('should return vocabulary with references and sentences', async () => {
      const vocab = await service.create(testUser.id, {
        original_word: '水果',
        pronunciation: 'shuǐguǒ',
        meaning: '{"en":"fruit"}',
      });

      const water = await service.create(testUser.id, {
        original_word: '水',
        pronunciation: 'shuǐ',
        meaning: '{"en":"water"}',
      });

      await VocabularyBankReference.create({
        vocabulary_id: vocab.id,
        referred_vocabulary_id: water.id,
      });

      await VocabularyBankSentence.create({
        vocabulary_id: vocab.id,
        material_id: 1,
        sentence_index: 0,
      });

      const result = await service.findOneWithRelations(vocab.id, testUser.id);
      expect(result.references).toHaveLength(1);
      expect(result.references[0].referred_vocabulary_id).toBe(water.id);
      expect(result.sentences).toHaveLength(1);
      expect(result.sentences[0].material_id).toBe(1);
    });
  });

  describe('create', () => {
    it('should create a vocabulary entry', async () => {
      const vocabulary = await service.create(testUser.id, {
        original_word: 'hello',
        pronunciation: 'həˈloʊ',
        meaning: '{"en":"greeting"}',
      });

      expect(vocabulary).toBeDefined();
      expect(vocabulary.id).toBeDefined();
      expect(vocabulary.user_id).toBe(testUser.id);
      expect(vocabulary.original_word).toBe('hello');
      expect(vocabulary.pronunciation).toBe('həˈloʊ');
      expect(vocabulary.meaning).toBe('{"en":"greeting"}');
    });
  });

  describe('update', () => {
    it('should update a vocabulary entry', async () => {
      const created = await service.create(testUser.id, {
        original_word: 'hello',
        pronunciation: 'həˈloʊ',
        meaning: '{"en":"greeting"}',
      });

      const updated = await service.update(created.id, testUser.id, {
        pronunciation: 'hɛˈloʊ',
      });

      expect(updated.pronunciation).toBe('hɛˈloʊ');
      expect(updated.original_word).toBe('hello');
    });

    it('should throw NotFoundException when updating non-existent vocabulary', async () => {
      await expect(
        service.update(999, testUser.id, { pronunciation: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft-delete a vocabulary entry', async () => {
      const created = await service.create(testUser.id, {
        original_word: 'hello',
        pronunciation: 'həˈloʊ',
        meaning: '{"en":"greeting"}',
      });

      await service.remove(created.id, testUser.id);

      const vocabularies = await service.findAll(testUser.id);
      expect(vocabularies).toHaveLength(0);
    });

    it('should cascade delete references and sentences', async () => {
      const vocab = await service.create(testUser.id, {
        original_word: '水果',
        pronunciation: 'shuǐguǒ',
        meaning: '{"en":"fruit"}',
      });

      const water = await service.create(testUser.id, {
        original_word: '水',
        pronunciation: 'shuǐ',
        meaning: '{"en":"water"}',
      });

      await VocabularyBankReference.create({
        vocabulary_id: vocab.id,
        referred_vocabulary_id: water.id,
      });

      await VocabularyBankSentence.create({
        vocabulary_id: vocab.id,
        material_id: 1,
        sentence_index: 0,
      });

      await service.remove(vocab.id, testUser.id);

      const references = await VocabularyBankReference.findAll({
        where: { vocabulary_id: vocab.id },
      });
      const sentences = await VocabularyBankSentence.findAll({
        where: { vocabulary_id: vocab.id },
      });
      expect(references).toHaveLength(0);
      expect(sentences).toHaveLength(0);
    });

    it('should throw NotFoundException when deleting non-existent vocabulary', async () => {
      await expect(service.remove(999, testUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('upsertWord', () => {
    it('should create a new vocabulary and sentence reference', async () => {
      const entry = await service.upsertWord(
        testUser.id,
        1,
        0,
        'hello',
        'greeting',
        'noun',
      );

      expect(entry).toBeDefined();
      expect(entry.original_word).toBe('hello');
      expect(entry.user_id).toBe(testUser.id);

      const sentences = await VocabularyBankSentence.findAll({
        where: { vocabulary_id: entry.id },
      });
      expect(sentences).toHaveLength(1);
      expect(sentences[0].material_id).toBe(1);
      expect(sentences[0].sentence_index).toBe(0);
    });

    it('should reuse existing vocabulary for same word', async () => {
      const first = await service.upsertWord(
        testUser.id,
        1,
        0,
        'hello',
        'greeting',
        'noun',
      );
      const second = await service.upsertWord(
        testUser.id,
        2,
        1,
        'hello',
        'greeting',
        'noun',
      );

      expect(first.id).toBe(second.id);

      const sentences = await VocabularyBankSentence.findAll({
        where: { vocabulary_id: first.id },
      });
      expect(sentences).toHaveLength(2);
    });

    it('should not create duplicate sentence references', async () => {
      await service.upsertWord(testUser.id, 1, 0, 'hello', 'greeting', 'noun');
      await service.upsertWord(testUser.id, 1, 0, 'hello', 'greeting', 'noun');

      const sentences = await VocabularyBankSentence.findAll({
        where: { vocabulary_id: { [Symbol.for('ne')]: null } },
      });
      expect(sentences).toHaveLength(1);
    });
  });

  describe('decomposeAndReference', () => {
    it('should create character references for CJK words', async () => {
      const water = await service.create(testUser.id, {
        original_word: '水',
        pronunciation: 'shuǐ',
        meaning: '{"en":"water"}',
      });
      const fruit = await service.create(testUser.id, {
        original_word: '果',
        pronunciation: 'guǒ',
        meaning: '{"en":"fruit/result"}',
      });
      const vocab = await service.create(testUser.id, {
        original_word: '水果',
        pronunciation: 'shuǐguǒ',
        meaning: '{"en":"fruit"}',
      });

      await service.decomposeAndReference(testUser.id, vocab.id, '水果');

      const references = await VocabularyBankReference.findAll({
        where: { vocabulary_id: vocab.id },
      });
      expect(references).toHaveLength(2);

      const referredIds = references.map((r) => r.referred_vocabulary_id);
      expect(referredIds).toContain(water.id);
      expect(referredIds).toContain(fruit.id);
    });

    it('should not create references for non-CJK words', async () => {
      const vocab = await service.create(testUser.id, {
        original_word: 'hello',
        pronunciation: 'həˈloʊ',
        meaning: '{"en":"greeting"}',
      });

      await service.decomposeAndReference(testUser.id, vocab.id, 'hello');

      const references = await VocabularyBankReference.findAll({
        where: { vocabulary_id: vocab.id },
      });
      expect(references).toHaveLength(0);
    });

    it('should not create duplicate references', async () => {
      const water = await service.create(testUser.id, {
        original_word: '水',
        pronunciation: 'shuǐ',
        meaning: '{"en":"water"}',
      });
      const vocab = await service.create(testUser.id, {
        original_word: '水水',
        pronunciation: 'shuǐshuǐ',
        meaning: '{"en":"water water"}',
      });

      await service.decomposeAndReference(testUser.id, vocab.id, '水水');

      const references = await VocabularyBankReference.findAll({
        where: { vocabulary_id: vocab.id },
      });
      expect(references).toHaveLength(1);
      expect(references[0].referred_vocabulary_id).toBe(water.id);
    });
  });
});
