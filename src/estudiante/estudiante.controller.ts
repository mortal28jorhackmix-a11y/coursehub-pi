import { EstudianteService } from './estudiante.service.js';
import { CreateEstudianteDto } from './dto/create-estudiante.dto.js';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto.js';
import {Body,Controller,Delete,Get,NotFoundException,Param,ParseIntPipe,Patch,Post,Query,} from '@nestjs/common';

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
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const estudiante = await this.estudianteService.findOne(id);
    if (!estudiante) throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
    return estudiante;
  }

  @Post()
  create(@Body() body: CreateEstudianteDto) {
    return this.estudianteService.create(body);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateEstudianteDto) {
    const estudiante = await this.estudianteService.update(id, body);
    if (!estudiante) throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
    return estudiante;
  }

  @Patch(':id/estado')
  async toggleActive(@Param('id', ParseIntPipe) id: number) {
    const estudiante = await this.estudianteService.toggleActive(id);
    if (!estudiante) throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
    return estudiante;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const estudiante = await this.estudianteService.remove(id);
    if (!estudiante) throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
    return estudiante;
  }
}