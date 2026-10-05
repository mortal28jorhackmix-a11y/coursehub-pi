import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { CreateEstudianteDto } from './dto/create-estudiante.dto.js';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto.js';
import { Student } from './entities/estudiante.entity.js';

@Injectable()
export class EstudianteService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  findAll(career?: string, semester?: number, isActive?: boolean): Promise<Student[]> {
    const where: FindOptionsWhere<Student> = {};
    if (career) where.career = career;
    if (semester !== undefined) where.semester = semester;
    if (isActive !== undefined) where.isActive = isActive;
    return this.studentRepo.find({ where, order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Student | undefined> {
    return (await this.studentRepo.findOneBy({ id })) ?? undefined;
  }

  async create(dto: CreateEstudianteDto): Promise<Student> {
    if (await this.studentRepo.existsBy({ email: dto.email })) {
      throw new ConflictException(`El correo ${dto.email} ya está registrado`);
    }
    return this.studentRepo.save(this.studentRepo.create(dto));
  }

  async update(id: number, dto: UpdateEstudianteDto): Promise<Student | undefined> {
    const estudiante = await this.findOne(id);
    if (!estudiante) return undefined;

    if (
      dto.email !== undefined &&
      (await this.studentRepo.existsBy({ email: dto.email, id: Not(id) }))
    ) {
      throw new ConflictException(`El correo ${dto.email} ya está registrado`);
    }

    Object.assign(estudiante, dto);
    return this.studentRepo.save(estudiante);
  }

  async toggleActive(id: number): Promise<Student | undefined> {
    const estudiante = await this.findOne(id);
    if (!estudiante) return undefined;

    estudiante.isActive = !estudiante.isActive;
    return this.studentRepo.save(estudiante);
  }

  async remove(id: number): Promise<Student | undefined> {
    const estudiante = await this.findOne(id);
    if (!estudiante) return undefined;

    if (!estudiante.isActive) {
      throw new ConflictException(
        `No se puede eliminar al estudiante con id ${id} porque está inactivo`,
      );
    }

    await this.studentRepo.delete(id);
    return estudiante;
  }
}