import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EstudianteService } from './estudiante.service.js';
import { Student } from './entities/estudiante.entity.js';

describe('EstudianteService', () => {
  let service: EstudianteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstudianteService,
        { provide: getRepositoryToken(Student), useValue: {} },
      ],
    }).compile();

    service = module.get<EstudianteService>(EstudianteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
