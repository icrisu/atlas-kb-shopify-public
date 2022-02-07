import { Injectable } from '@nestjs/common';
import { AppSharedService } from './shared/services/app.shared.service';

@Injectable()
export class AppService {

	constructor(private readonly appSharedService: AppSharedService) {}

	async getStatus(): Promise<any> {
		return await this.appSharedService.getAppStatus();
	}
}
