import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VocabularyBankService } from './vocabulary-bank.service';
import { CreateVocabularyBankDto } from './dto/create-vocabulary-bank.dto';
import { UpdateVocabularyBankDto } from './dto/update-vocabulary-bank.dto';
import type { VocabularyBank } from './entities/vocabulary-bank.entity';
import type { VocabularyBankReference } from './entities/vocabulary-bank-reference.entity';
import type { VocabularyBankSentence } from './entities/vocabulary-bank-sentence.entity';

interface RequestWithUser extends Request {
  user: { id: number; email: string };
}

@ApiTags('Vocabulary Bank')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vocabularies')
export class VocabularyBankController {
  constructor(private readonly vocabularyBankService: VocabularyBankService) {}

  @Get()
  @ApiOperation({ summary: 'List all vocabularies for the authenticated user' })
  findAll(@Request() req: RequestWithUser): Promise<VocabularyBank[]> {
    return this.vocabularyBankService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a vocabulary by ID with references and sentences',
  })
  findOne(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<
    VocabularyBank & {
      references: VocabularyBankReference[];
      sentences: VocabularyBankSentence[];
    }
  > {
    return this.vocabularyBankService.findOneWithRelations(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new vocabulary entry' })
  create(
    @Request() req: RequestWithUser,
    @Body() dto: CreateVocabularyBankDto,
  ): Promise<VocabularyBank> {
    return this.vocabularyBankService.create(req.user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a vocabulary entry' })
  update(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVocabularyBankDto,
  ): Promise<VocabularyBank> {
    return this.vocabularyBankService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a vocabulary entry' })
  async remove(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.vocabularyBankService.remove(id, req.user.id);
    return { message: 'Vocabulary deleted successfully' };
  }
}
