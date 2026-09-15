import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { EstudianteService } from './estudiante.service.js';
import { CreateEstudianteDto } from './dto/create-estudiante.dto.js';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto.js';

@Controller('estudiantes')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Get()
  findAll(
    @Query('career') career?: string,
    @Query('semester') semester?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.estudianteService.findAll(
      career,
      semester ? Number(semester) : undefined,
      isActive ? isActive === 'true' : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const estudiante = this.estudianteService.findOne(Number(id));
    if (!estudiante) throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
    return estudiante;
  }

  @Post()
  create(@Body() body: CreateEstudianteDto) {
    return this.estudianteService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateEstudianteDto) {
    const estudiante = this.estudianteService.update(Number(id), body);
    if (!estudiante) throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
    return estudiante;
  }

  @Patch(':id/estado')
  toggleActive(@Param('id') id: string) {
    const estudiante = this.estudianteService.toggleActive(Number(id));
    if (!estudiante) throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
    return estudiante;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const estudiante = this.estudianteService.remove(Number(id));
    if (!estudiante) throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
    return estudiante;
  }
}