import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { UpdateCourseUseCase } from './use-cases/update-course.use-case.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { UserRole } from '../users/user-role.enum.js';

describe('CoursesController', () => {
  let controller: CoursesController;

  const updateCourse = {
    execute: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({  
      controllers: [CoursesController],
      providers: [
        { provide: CoursesService, useValue: {} },
        { provide: UpdateCourseUseCase, useValue: updateCourse },
        { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
        { provide: RolesGuard, useValue: { canActivate: () => true } },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
  });

  it('delega la actualización con el id, el DTO y el usuario autenticado', async () => {
    const actor = {
      id: 4,
      email: 'docente@example.com',
      role: UserRole.TEACHER,
    };
    const dto = { title: 'NestJS avanzado' };
    const expected = { id: 7, ...dto };

    updateCourse.execute.mockResolvedValue(expected);

    await expect(controller.update(7, dto, actor)).resolves.toEqual(expected);
    expect(updateCourse.execute).toHaveBeenCalledWith(7, dto, actor);
  });
});