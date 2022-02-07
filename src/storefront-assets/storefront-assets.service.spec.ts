import { Test, TestingModule } from '@nestjs/testing';
import { StorefrontAssetsService } from './storefront-assets.service';

describe('StorefrontAssetsService', () => {
  let service: StorefrontAssetsService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorefrontAssetsService],
    }).compile();
    service = module.get<StorefrontAssetsService>(StorefrontAssetsService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
