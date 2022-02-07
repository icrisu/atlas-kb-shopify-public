import { Test, TestingModule } from '@nestjs/testing';
import { BillingController } from './billing.controller';

describe('Billing Controller', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [BillingController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: BillingController = module.get<BillingController>(BillingController);
    expect(controller).toBeDefined();
  });
});
