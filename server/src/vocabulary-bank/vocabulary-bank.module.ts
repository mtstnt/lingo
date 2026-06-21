import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { VocabularyBank } from './entities/vocabulary-bank.entity';
import { VocabularyBankReference } from './entities/vocabulary-bank-reference.entity';
import { VocabularyBankSentence } from './entities/vocabulary-bank-sentence.entity';
import { VocabularyBankService } from './vocabulary-bank.service';
import { VocabularyBankController } from './vocabulary-bank.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      VocabularyBank,
      VocabularyBankReference,
      VocabularyBankSentence,
    ]),
  ],
  controllers: [VocabularyBankController],
  providers: [VocabularyBankService],
  exports: [VocabularyBankService],
})
export class VocabularyBankModule {}
