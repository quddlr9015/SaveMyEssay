import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: `/cloudsql/${configService.get<string>('DB_CONNECTION_NAME')}`,
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'postgres'),
    database: configService.get<string>('DB_DATABASE', 'Lingrade'),
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: true,
    extra: {
        socketPath: `/cloudsql/${configService.get<string>('DB_CONNECTION_NAME')}`,
    },
});