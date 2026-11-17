import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'; // 1

@Entity('courses') // 2
export class Course { // 3
  @PrimaryGeneratedColumn() // 4
  id: number;

  @Column({ type: 'int', nullable: true })
  createdByUserId: number | null;

  @Column() // 5
  title: string;

  @Column() // 6
  level: string;
}