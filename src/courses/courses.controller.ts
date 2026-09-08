import { Controller, Get, Param, Query } from '@nestjs/common';
import { CoursesService } from './courses.service.js';

@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) {}

    @Get()
    findALL(@Query('level') level ?: string) {
        return this.coursesService.findALL(level);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.coursesService.findOne(Number(id));
    }
}

