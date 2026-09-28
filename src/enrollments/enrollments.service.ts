// Gestiona las reglas de negocio de las matrículas.
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstudianteService } from '../estudiante/estudiante.service.js';
import { CoursesService } from '../courses/courses.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';

type Enrollment = {
  id: number;
  studentId: number;
  courseId: number;
};

@Injectable()
export class EnrollmentsService {
  private readonly enrollments: Enrollment[] = [];
  private nextId = 1;

  constructor(
    private readonly estudianteService: EstudianteService,
    private readonly coursesService: CoursesService,
  ) {}

  create(dto: CreateEnrollmentDto): Enrollment { // dto crear inscripcines 
    const student = this.estudianteService.findOne(dto.studentId);
    if (!student) {
      throw new NotFoundException(`El estudiante ${dto.studentId} no existe`);
    }

    const course = this.coursesService.findOne(dto.courseId);
    if (!course) {
      throw new NotFoundException(`El curso ${dto.courseId} no existe`);
    }

    if (!student.isActive) {
      throw new BadRequestException(
        `El estudiante ${dto.studentId} esta inactivo y no puede matricularse`,
      );
    }

    const duplicated = this.enrollments.some(
      (e) => e.studentId === dto.studentId && e.courseId === dto.courseId,
    );
    if (duplicated) {
      throw new ConflictException(
        `El estudiante ${dto.studentId} ya esta matriculado en el curso ${dto.courseId}`,
      );
    }

    const enrollment: Enrollment = {
      id: this.nextId++,
      studentId: dto.studentId,
      courseId: dto.courseId,
    };
    this.enrollments.push(enrollment);
    return enrollment;
  }

  findAll(studentId?: number, courseId?: number): Enrollment[] {
    return this.enrollments.filter(
      (e) =>
        (studentId === undefined || e.studentId === studentId) &&
        (courseId === undefined || e.courseId === courseId),
    );
  }

  findByStudent(studentId: number): Enrollment[] {
    if (!this.estudianteService.findOne(studentId)) {
      throw new NotFoundException(`El estudiante ${studentId} no existe`);
    }
    return this.findAll(studentId, undefined);
  }

  findByCourse(courseId: number): Enrollment[] {
    if (!this.coursesService.findOne(courseId)) {
      throw new NotFoundException(`El curso ${courseId} no existe`);
    }
    return this.findAll(undefined, courseId);
  }

  remove(id: number): Enrollment {
    const index = this.enrollments.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new NotFoundException(`La matricula ${id} no existe`);
    }
    const [removed] = this.enrollments.splice(index, 1);
    return removed;
  }
}
