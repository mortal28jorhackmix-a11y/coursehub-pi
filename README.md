# Trabajo Práctico - NestJS

## Descripción

Este proyecto implementa una API REST con NestJS para gestionar:

- Cursos
- Estudiantes
- Matrículas

Incluye validaciones con `class-validator`, control de errores mediante excepciones HTTP y módulos organizados por dominio.

## Módulos principales

El proyecto está organizado en tres módulos principales:

- `courses`
- `estudiante`
- `enrollments`

### Estructura

```text
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
│
├── courses/
│   ├── courses.controller.ts
│   ├── courses.module.ts
│   ├── courses.service.ts
│   └── dto/
│       └── create-course.dto.ts
│
├── enrollments/
│   ├── enrollments.controller.ts
│   ├── enrollments.module.ts
│   ├── enrollments.service.ts
│   └── dto/
│       └── create-enrollment.dto.ts
│
└── estudiante/
    ├── estudiante.controller.ts
    ├── estudiante.module.ts
    ├── estudiante.service.ts
    ├── dto/
    │   ├── create-estudiante.dto.ts
    │   └── update-estudiante.dto.ts
    └── pipes/
        └── parse-optional-semester.pipe.ts