import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
// Es el archivo organizador que agrupa el controlador
//  y el servicio de cursos, permitiendo que NestJS los registre e 
// integre correctamente en la aplicación principal