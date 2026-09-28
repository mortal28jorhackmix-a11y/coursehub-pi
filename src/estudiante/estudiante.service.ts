import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateEstudianteDto } from './dto/create-estudiante.dto.js';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto.js';

type Estudiante = {
  id: number;
  name: string;
  email: string;
  age: number;
  career: string;
  semester: number;
  isActive: boolean;
};

@Injectable()
export class EstudianteService {
  private estudiantes: Estudiante[] = [
    { id: 1, name: 'Alan Cedeño', email: 'Alan123@example.com', age: 20, career: 'Software Engineering', semester: 2, isActive: true },
    { id: 2, name: 'Arturo Vidal', email: 'Artuto123@example.com', age: 22, career: 'Software Engineering', semester: 4, isActive: true },
    { id: 3, name: 'Alfondo Montero', email: 'Alfondo123@example.com', age: 25, career: 'Software Engineering', semester: 6, isActive: false },
  ];

  findAll(career?: string, semester?: number, isActive?: boolean): Estudiante[] {
    return this.estudiantes.filter((estudiante) => {
      if (career && estudiante.career !== career) return false;
      if (semester !== undefined && estudiante.semester !== semester) return false;
      if (isActive !== undefined && estudiante.isActive !== isActive) return false;
      return true;
    });
  }

  findOne(id: number): Estudiante | undefined {

    return this.estudiantes.find((estudiante) => estudiante.id === id);
  }

  create(dto: CreateEstudianteDto): Estudiante {
    if (this.estudiantes.some((e) => e.email === dto.email)) {
      throw new ConflictException(`El correo ${dto.email} ya está registrado`);
    }

    const estudiante: Estudiante = {
      id: Math.max(0, ...this.estudiantes.map((item) => item.id)) + 1,
      ...dto,
    };

    this.estudiantes.push(estudiante);
    return estudiante;
  }

  update(id: number, dto: UpdateEstudianteDto): Estudiante | undefined {
    const estudiante = this.findOne(id);

    if (!estudiante) {
      return undefined;
    }

    if (dto.email !== undefined && this.estudiantes.some((e) => e.email === dto.email && e.id !== id)) {
      throw new ConflictException(`El correo ${dto.email} ya está registrado`);
    }

    Object.assign(estudiante, dto);
    return estudiante;
  }


  toggleActive(id: number): Estudiante | undefined {
    const estudiante = this.findOne(id);

    if (!estudiante) {
      return undefined;
    }

    estudiante.isActive = !estudiante.isActive;
    return estudiante;
  }

  remove(id: number): Estudiante | undefined {
    const estudiante = this.findOne(id);

    if (!estudiante) {
      return undefined;
    }

    if (!estudiante.isActive) {
      throw new ConflictException(`No se puede eliminar al estudiante con id ${id} porque está inactivo`);
    }

    const index = this.estudiantes.findIndex((e) => e.id === id);
    const [removedEstudiante] = this.estudiantes.splice(index, 1);
    return removedEstudiante;
  }
}