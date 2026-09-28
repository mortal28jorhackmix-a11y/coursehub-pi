import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseOptionalSemesterPipe implements PipeTransform {
  transform(value: string | undefined): number | undefined {
    if (value === undefined || value === '') {
      return undefined;
    }

    const semester = Number(value);

    if (Number.isNaN(semester)) {
      throw new BadRequestException('El parámetro semester debe ser un número');
    }

    if (semester < 1 || semester > 10) {
      throw new BadRequestException('El parámetro semester debe estar entre 1 y 10');
    }

    return semester;
  }
}