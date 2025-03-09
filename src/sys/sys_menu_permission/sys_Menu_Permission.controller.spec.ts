import { Test, TestingModule } from '@nestjs/testing';
import { SysMenuPermissionController } from './sys_Menu_Permission.controller';

describe('SysMenuPermissionController', () => {
  let controller: SysMenuPermissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SysMenuPermissionController],
    }).compile();

    controller = module.get<SysMenuPermissionController>(
      SysMenuPermissionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
