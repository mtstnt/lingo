import { PartialType } from '@nestjs/swagger';
import { CreateVocabularyBankDto } from './create-vocabulary-bank.dto';

export class UpdateVocabularyBankDto extends PartialType(
  CreateVocabularyBankDto,
) {}
