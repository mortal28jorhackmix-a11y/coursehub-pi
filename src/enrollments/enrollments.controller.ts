// SIRVE para crear, leer o gestionar las inscripciones.
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js'; //dto

@Controller() 
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post('enrollments') // PARA CREAR UNA INSCRIPCIÓN, SE USA EL MÉTODO POST
  create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(dto);
  }

  @Get('enrollments') // PARA OBTENER TODAS LAS INSCRIPCIONES
  findAll(
    @Query('studentId', new ParseIntPipe({ optional: true }))
    studentId?: number,
    @Query('courseId', new ParseIntPipe({ optional: true }))
    courseId?: number,
  ) {
    return this.enrollmentsService.findAll(studentId, courseId);
  }

  @Get('students/:studentId/enrollments') // PARA OBTENER TODAS LAS INSCRIPCIONES DE UN ESTUDIANTE
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.enrollmentsService.findByStudent(studentId);
  }

  @Get('courses/:courseId/enrollments')

  findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.enrollmentsService.findByCourse(courseId);
  }

  @Delete('enrollments/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.remove(id);
  }
}
