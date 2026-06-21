import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { VocabularyBank } from './entities/vocabulary-bank.entity';
import { VocabularyBankReference } from './entities/vocabulary-bank-reference.entity';
import { VocabularyBankSentence } from './entities/vocabulary-bank-sentence.entity';
import { CreateVocabularyBankDto } from './dto/create-vocabulary-bank.dto';
import { UpdateVocabularyBankDto } from './dto/update-vocabulary-bank.dto';

const CJK_REGEX = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/;

@Injectable()
export class VocabularyBankService {
  constructor(
    @InjectModel(VocabularyBank)
    private readonly vocabularyBankModel: typeof VocabularyBank,
    @InjectModel(VocabularyBankReference)
    private readonly referenceModel: typeof VocabularyBankReference,
    @InjectModel(VocabularyBankSentence)
    private readonly sentenceModel: typeof VocabularyBankSentence,
  ) {}

  async findAll(userId: number): Promise<VocabularyBank[]> {
    return this.vocabularyBankModel.findAll({
      where: { user_id: userId },
    });
  }

  async findOne(id: number, userId: number): Promise<VocabularyBank> {
    const vocabulary = await this.vocabularyBankModel.findOne({
      where: { id, user_id: userId },
    });
    if (!vocabulary) {
      throw new NotFoundException('Vocabulary not found');
    }
    return vocabulary;
  }

  async findOneWithRelations(
    id: number,
    userId: number,
  ): Promise<
    VocabularyBank & {
      references: VocabularyBankReference[];
      sentences: VocabularyBankSentence[];
    }
  > {
    const vocabulary = await this.findOne(id, userId);

    const [references, sentences] = await Promise.all([
      this.referenceModel.findAll({ where: { vocabulary_id: id } }),
      this.sentenceModel.findAll({ where: { vocabulary_id: id } }),
    ]);

    return Object.assign(vocabulary, {
      references,
      sentences,
    });
  }

  async create(
    userId: number,
    dto: CreateVocabularyBankDto,
  ): Promise<VocabularyBank> {
    return this.vocabularyBankModel.create({
      user_id: userId,
      original_word: dto.original_word,
      pronunciation: dto.pronunciation,
      meaning: dto.meaning,
    });
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateVocabularyBankDto,
  ): Promise<VocabularyBank> {
    const vocabulary = await this.findOne(id, userId);
    return vocabulary.update(dto);
  }

  async remove(id: number, userId: number): Promise<void> {
    const vocabulary = await this.findOne(id, userId);

    await this.referenceModel.destroy({
      where: {
        [Op.or]: [{ vocabulary_id: id }, { referred_vocabulary_id: id }],
      },
    });

    await this.sentenceModel.destroy({ where: { vocabulary_id: id } });

    await vocabulary.destroy();
  }

  async upsertWord(
    userId: number,
    materialId: number,
    sentenceIndex: number,
    word: string,
    meaning: string,
    details: string,
  ): Promise<VocabularyBank> {
    let vocabulary = await this.vocabularyBankModel.findOne({
      where: { user_id: userId, original_word: word },
    });

    if (!vocabulary) {
      vocabulary = await this.vocabularyBankModel.create({
        user_id: userId,
        original_word: word,
        pronunciation: '',
        meaning: JSON.stringify({ details, meaning }),
      });
    }

    const existingSentence = await this.sentenceModel.findOne({
      where: {
        vocabulary_id: vocabulary.id,
        material_id: materialId,
        sentence_index: sentenceIndex,
      },
    });

    if (!existingSentence) {
      await this.sentenceModel.create({
        vocabulary_id: vocabulary.id,
        material_id: materialId,
        sentence_index: sentenceIndex,
      });
    }

    return vocabulary;
  }

  async decomposeAndReference(
    userId: number,
    vocabularyId: number,
    word: string,
  ): Promise<void> {
    if (!CJK_REGEX.test(word)) {
      return;
    }

    const characters = [...word].filter((char) => CJK_REGEX.test(char));

    for (const char of characters) {
      const charEntry = await this.vocabularyBankModel.findOne({
        where: { user_id: userId, original_word: char },
      });

      if (charEntry) {
        const existingRef = await this.referenceModel.findOne({
          where: {
            vocabulary_id: vocabularyId,
            referred_vocabulary_id: charEntry.id,
          },
        });

        if (!existingRef) {
          await this.referenceModel.create({
            vocabulary_id: vocabularyId,
            referred_vocabulary_id: charEntry.id,
          });
        }
      }
    }
  }
}
