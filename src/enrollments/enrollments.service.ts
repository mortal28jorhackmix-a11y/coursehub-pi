import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Course } from '../courses/entities/course.entity.js';
import { Student } from '../estudiante/entities/estudiante.entity.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { Enrollment } from './entities/enrollment.entity.js';
import {BadRequestException,ConflictException,Injectable,NotFoundException, } from '@nestjs/common';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  async create(dto: CreateEnrollmentDto): Promise<Enrollment> {
    const student = await this.studentRepo.findOneBy({ id: dto.studentId });
    if (!student) {
      throw new NotFoundException(`El estudiante ${dto.studentId} no existe`);
    }

    const course = await this.courseRepo.findOneBy({ id: dto.courseId });
    if (!course) {
      throw new NotFoundException(`El curso ${dto.courseId} no existe`);
    }

    if (!student.isActive) {
      throw new BadRequestException(
        `El estudiante ${dto.studentId} esta inactivo y no puede matricularse`,
      );
    }

    const duplicated = await this.enrollmentRepo.existsBy({
      student: { id: dto.studentId },
      course: { id: dto.courseId },
    });
    if (duplicated) {
      throw new ConflictException(
        `El estudiante ${dto.studentId} ya esta matriculado en el curso ${dto.courseId}`,
      );
    }

    return this.enrollmentRepo.save(this.enrollmentRepo.create({ student, course }));
  }

  findAll(studentId?: number, courseId?: number): Promise<Enrollment[]> {
    const where: FindOptionsWhere<Enrollment> = {};
    if (studentId !== undefined) where.student = { id: studentId };
    if (courseId !== undefined) where.course = { id: courseId };

    return this.enrollmentRepo.find({
      where,
      relations: { student: true, course: true },
      order: { id: 'ASC' },
    });
  }

  async findByStudent(studentId: number): Promise<Enrollment[]> {
    if (!(await this.studentRepo.existsBy({ id: studentId }))) {
      throw new NotFoundException(`El estudiante ${studentId} no existe`);
    }
    return this.findAll(studentId, undefined);
  }

  async findByCourse(courseId: number): Promise<Enrollment[]> {
    if (!(await this.courseRepo.existsBy({ id: courseId }))) {
      throw new NotFoundException(`El curso ${courseId} no existe`);
    }
    return this.findAll(undefined, courseId);
  }

  async remove(id: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id },
      relations: { student: true, course: true },
    });
    if (!enrollment) {
      throw new NotFoundException(`La matricula ${id} no existe`);
    }
    await this.enrollmentRepo.delete(id);
    return enrollment;
  }
}