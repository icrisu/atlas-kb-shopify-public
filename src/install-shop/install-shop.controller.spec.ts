import { Test, TestingModule } from '@nestjs/testing';
import { InstallShopController } from './install-shop.controller';

describe('InstallShop Controller', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [InstallShopController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: InstallShopController = module.get<InstallShopController>(InstallShopController);
    expect(controller).toBeDefined();
  });
});
