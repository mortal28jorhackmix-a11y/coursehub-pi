import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Course } from '../courses/entities/course.entity.js';
import { Student } from '../estudiante/entities/estudiante.entity.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { EnrollmentsQueryDto } from './dto/query-enrollments.dto.js';
import { Enrollment } from './entities/enrollment.entity.js';
import {BadRequestException,ConflictException,Injectable,NotFoundException, } from '@nestjs/common';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentsRepository: Repository<Enrollment>,
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

    const duplicated = await this.enrollmentsRepository.existsBy({
      student: { id: dto.studentId },
      course: { id: dto.courseId },
    });
    if (duplicated) {
      throw new ConflictException(
        `El estudiante ${dto.studentId} ya esta matriculado en el curso ${dto.courseId}`,
      );
    }

    return this.enrollmentsRepository.save(
      this.enrollmentsRepository.create({ student, course }),
    );
  }

  // Semana 6 · Sesión 12
  async search(query: EnrollmentsQueryDto) {
    const qb = this.enrollmentsRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.course', 'course');

    if (query.search) {
      qb.andWhere('(student.name ILIKE :search OR course.title ILIKE :search)', {
        search: `%${query.search.trim()}%`,
      });
    }
    if (query.studentId) qb.andWhere('student.id = :studentId', { studentId: query.studentId });
    if (query.courseId) qb.andWhere('course.id = :courseId', { courseId: query.courseId });
    if (query.activeOnly === 'true') qb.andWhere('student.isActive = :active', { active: true });

    qb.orderBy('enrollment.id', 'ASC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, meta: { total, page: query.page, limit: query.limit } };
  }

  findAll(studentId?: number, courseId?: number): Promise<Enrollment[]> {
    const where: FindOptionsWhere<Enrollment> = {};
    if (studentId !== undefined) where.student = { id: studentId };
    if (courseId !== undefined) where.course = { id: courseId };

    return this.enrollmentsRepository.find({
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
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { id },
      relations: { student: true, course: true },
    });
    if (!enrollment) {
      throw new NotFoundException(`La matricula ${id} no existe`);
    }
    await this.enrollmentsRepository.delete(id);
    return enrollment;
  }
}