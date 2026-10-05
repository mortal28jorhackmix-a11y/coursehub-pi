import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Student } from '../../estudiante/entities/estudiante.entity.js';
import { Course } from '../../courses/entities/course.entity.js';

@Entity('enrollments')
@Unique(['student', 'course'])
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, { nullable: false, onDelete: 'CASCADE' })
  student: Student;

  @ManyToOne(() => Course, { nullable: false, onDelete: 'CASCADE' })
  course: Course;
}