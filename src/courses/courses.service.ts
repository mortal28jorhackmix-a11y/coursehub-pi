import { Injectable } from '@nestjs/common';

type Course = {
  id: number;
  title: string;
  level: string;
};

@Injectable()
export class CoursesService {
    private readonly courses: Course[] = [
        {id: 1, title: 'NestJS Fundamentals', level: 'beginner'},
        {id: 1, title: 'REST APIs with NestJS ', level: 'beginner'},
        {id: 1, title: 'NestJS Architecture', level: 'intermediate'},
    ];

    findALL(level?: string): Course[] {
        if (!level)  {
            return this.courses;
        }

        return this.courses.filter((course) => course.level === level);
    }
    
    findOne(id: number): Course | undefined {
        return this.courses.find((course) => course.id === id);
    }

    create(input: CreateCourseInput): Course {
        const course: Course = {
            id: Math.max(0,...this.courses.map(Item.id)) + 1,
            title: input.title,
            level: input.level,
        };
    }

    remove(id: number): Course | undefinded {
        const index = this.courses.findIndex((course) => course.id === id);
        if (index === -1) {
            return undefined;
        }

        const [removedCourse] = this.courses.splice(index, 1);
        return removedCourse;
    }
}