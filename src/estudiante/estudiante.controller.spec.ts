import { Test, TestingModule } from '@nestjs/testing';
import { EstudianteController } from './estudiante.controller.js';
import { EstudianteService } from './estudiante.service.js';

describe('EstudianteController', () => {
  let controller: EstudianteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstudianteController],
      providers: [EstudianteService],
    }).compile();

    controller = module.get<EstudianteController>(EstudianteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
