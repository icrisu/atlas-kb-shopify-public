import { Module, Global } from '@nestjs/common';
import { ConfigurationService } from './configuration/configuration.service';
import { ShopAuthService } from './shop-auth/shop-auth.service';
import { AWSS3Service } from './services/aws.s3.service';
import { LogReporterService } from './services/log.reporter.service';
import { AWSCloudWatchLogsService } from './services/aws.cloudwatch.logs.service';
import { NotificationsService } from './notifications/notifications.service';
import { JWTService } from './services/jwt.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AppSchema } from './schemas/AppSchema';
import { AppSharedService } from './services/app.shared.service';

@Global()
@Module({
    imports: [MongooseModule.forFeature([{ name: 'App', schema: AppSchema }])],
    providers: [ConfigurationService, ShopAuthService, AWSS3Service, LogReporterService,
        AWSCloudWatchLogsService, NotificationsService, JWTService, AppSharedService],
    exports: [ConfigurationService, ShopAuthService, AWSS3Service, LogReporterService,
        AWSCloudWatchLogsService, NotificationsService, JWTService, AppSharedService],
})
export class SharedModule {}
