import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = 3000;
  await app.listen(process.env.PORT ?? 3000);
  Logger.log(`Application Running on port ${port}`)
}
bootstrap();
