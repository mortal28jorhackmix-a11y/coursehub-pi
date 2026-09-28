import { Module } from '@nestjs/common';
import { EnrollmentsController } from './enrollments.controller.js';
import { EnrollmentsService } from './enrollments.service.js';
import { EstudianteModule } from '../estudiante/estudiante.module.js';
import { CoursesModule } from '../courses/courses.module.js';

@Module({ 
  imports: [EstudianteModule, CoursesModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
})
export class EnrollmentsModule {}
