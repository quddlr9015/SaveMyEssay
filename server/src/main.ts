import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { loadSecretsAuto } from './configs/secrets.config';

async function bootstrap() {
  // load secrets from secret manager
  if (process.env.NODE_ENV !== 'development') {
    console.log('loading secrets from secret manager')
    const secrets = await loadSecretsAuto();
    Object.assign(process.env, secrets);
  }

  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT;

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.use(cookieParser());

  await app.listen(port ?? 8080);
  Logger.log(`Application Running on port ${port}`)
}

bootstrap();
