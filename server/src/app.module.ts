import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { BullModule } from '@nestjs/bull';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ResourceModule } from './resource/resource.module';
import { ResourceQueueModule } from './resource-queue/resource-queue.module';
import { MaterialModule } from './material/material.module';
import { VocabularyBankModule } from './vocabulary-bank/vocabulary-bank.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        dialect: 'postgres',
        uri: config.getOrThrow('DATABASE_URL'),
        autoLoadModels: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: config.getOrThrow('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    ResourceModule,
    ResourceQueueModule,
    MaterialModule,
    VocabularyBankModule,
  ],
})
export class AppModule {}
