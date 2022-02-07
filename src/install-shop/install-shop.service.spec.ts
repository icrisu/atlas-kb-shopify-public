import { Test, TestingModule } from '@nestjs/testing';
import { InstallShopService } from './install-shop.service';

describe('InstallShopService', () => {
  let service: InstallShopService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstallShopService],
    }).compile();
    service = module.get<InstallShopService>(InstallShopService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
