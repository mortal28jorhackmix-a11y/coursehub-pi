import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstudianteController } from './estudiante.controller.js';
import { EstudianteService } from './estudiante.service.js';
import { Student } from './entities/estudiante.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Student])],
  controllers: [EstudianteController],
  providers: [EstudianteService],
  exports: [EstudianteService],
})
export class EstudianteModule {}