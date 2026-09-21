import { Module } from '@nestjs/common';
import { EstudianteController } from './estudiante.controller.js';
import { EstudianteService } from './estudiante.service.js';

@Module({
  controllers: [EstudianteController],
  providers: [EstudianteService]
})
export class EstudianteModule {}

@Module({
  controllers: [EstudianteController],
  providers: [EstudianteService],
  exports: [EstudianteService],