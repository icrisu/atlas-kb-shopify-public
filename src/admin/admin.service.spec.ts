import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService],
    }).compile();
    service = module.get<AdminService>(AdminService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
