import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVocabularyBankDto {
  @ApiProperty({ example: '水果', description: 'The vocabulary word' })
  @IsString()
  @IsNotEmpty()
  original_word!: string;

  @ApiProperty({
    example: 'shuǐguǒ',
    description: 'Pronunciation (pinyin, hiragana, or phonetic)',
  })
  @IsString()
  @IsNotEmpty()
  pronunciation!: string;

  @ApiProperty({
    example: '{"en":"fruit"}',
    description: 'Meaning as JSON string',
  })
  @IsString()
  @IsNotEmpty()
  meaning!: string;
}
