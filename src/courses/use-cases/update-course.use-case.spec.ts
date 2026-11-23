import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCourseUseCase } from './update-course.use-case.js';
import { COURSE_REPOSITORY } from '../repositories/course.repository.js';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Course } from '../entities/course.entity.js';
import { UserRole } from '../../users/user-role.enum.js';

describe('UpdateCourseUseCase', () => {
  let useCase: UpdateCourseUseCase;

  const courses = {
    findById: vi.fn(),
    save: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCourseUseCase,
        { provide: COURSE_REPOSITORY, useValue: courses },
      ],
    }).compile();

    useCase = module.get<UpdateCourseUseCase>(UpdateCourseUseCase);
  });
  it('permite al docente propietario actualizar un curso', async () => {
  const course = {
    id: 7,
    title: 'NestJS',
    level: 'beginner',
    createdByUserId: 4,
  } as Course;

  courses.findById.mockResolvedValue(course);
  courses.save.mockImplementation(async (value) => value);

  const result = await useCase.execute(
    7,
    { title: 'NestJS avanzado' },
    { id: 4, email: 'docente@example.com', role: UserRole.TEACHER },
  );

  expect(result.title).toBe('NestJS avanzado');
  expect(courses.save).toHaveBeenCalledWith(course);
});

it('rechaza la actualización de un curso de otro docente', async () => {
  courses.findById.mockResolvedValue({
    id: 7,
    title: 'NestJS',
    level: 'beginner',
    createdByUserId: 4,
  });

  await expect(
    useCase.execute(
      7,
      { title: 'Cambio' },
      { id: 9, email: 'otro@example.com', role: UserRole.TEACHER },
    ),
  ).rejects.toThrow(ForbiddenException);

  expect(courses.save).not.toHaveBeenCalled();
});
it('rechaza la actualización cuando el curso no existe', async () => {
  courses.findById.mockResolvedValue(null);

  await expect(
    useCase.execute(
      99,
      { title: 'Curso inexistente' },
      { id: 4, email: 'docente@example.com', role: UserRole.TEACHER },
    ),
  ).rejects.toThrow(NotFoundException);

  expect(courses.save).not.toHaveBeenCalled();
});
});