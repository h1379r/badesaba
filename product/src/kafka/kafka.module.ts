import { Module } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { Kafka } from 'kafkajs';
import appEnvConfig from 'src/config/app-env.config';
import { KAFKA_CLIENT } from './constant/kafka.constant';

@Module({
  providers: [
    {
      provide: KAFKA_CLIENT,
      useFactory: (
        configService: ConfigService<ConfigType<typeof appEnvConfig>>,
      ) => {
        const kafkaEnvConfig = configService.get('kafka', { infer: true });

        return new Kafka({
          brokers: [kafkaEnvConfig.broker],
          clientId: kafkaEnvConfig.clientId,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [KAFKA_CLIENT],
})
export class KafkaModule {}
