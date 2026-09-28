import { IsInt, IsPositive } from 'class-validator';
// PARA QUE  NO HAYANA ERRORES 
export class CreateEnrollmentDto {
  @IsInt() //PARA QUE SEA ENTERO
  @IsPositive() //PARA QUE SEA POSITIVO
  studentId: number;

  @IsInt()
  @IsPositive()
  courseId: number;
}
