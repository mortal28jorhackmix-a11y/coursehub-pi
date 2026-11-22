import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { COURSE_REPOSITORY } from '../repositories/course.repository.js';
import type { CourseRepository } from '../repositories/course.repository.js';
import type { UpdateCourseDto } from '../dto/update-course.dto.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.type.js';
import { UserRole } from '../../users/user-role.enum.js';

@Injectable()
export class UpdateCourseUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY) private readonly courses: CourseRepository,
  ) {}

  async execute(id: number, changes: UpdateCourseDto, actor: AuthenticatedUser) {
    const course = await this.courses.findById(id);
    if (!course) throw new NotFoundException(`Course ${id} not found`);

    if (actor.role !== UserRole.ADMIN && course.createdByUserId !== actor.id) {
      throw new ForbiddenException('You cannot modify this course');
    }

    Object.assign(course, changes);
    return this.courses.save(course);
  }
}