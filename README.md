# Trabajo Práctico - NestJS

## Descripción

Este proyecto implementa una API REST con NestJS para gestionar:

- Cursos
- Estudiantes
- Matrículas

Incluye validaciones con `class-validator`, control de errores con excepciones HTTP y módulos organizados por dominio.

## Repositorio y estructura final

El proyecto quedó integrado con los tres módulos principales funcionando en conjunto:

- `courses`
- `estudiante`
- `enrollments`

### Listado de rutas de carpetas

El número de serie del volumen es 36FD-82F2

```text
C:\USERS\USUARIO\DESKTOP\TRABAJO PRACTICO_2\TRABAJO_PRACTICO\SRC
│   app.controller.spec.ts
│   app.controller.ts
│   app.module.ts
│   app.service.ts
│   main.ts
│
├───courses
│   │   courses.controller.spec.ts
│   │   courses.controller.ts
│   │   courses.module.ts
│   │   courses.service.spec.ts
│   │   courses.service.ts
│   │
│   └───dto
│           create-course.dto.ts
│
├───enrollments
│   │   enrollments.controller.ts
│   │   enrollments.module.ts
│   │   enrollments.service.ts
│   │
│   └───dto
│           create-enrollment.dto.ts
│
└───estudiante
    │   estudiante.controller.spec.ts
    │   estudiante.controller.ts
    │   estudiante.module.ts
    │   estudiante.service.spec.ts
    │   estudiante.service.ts
    │
    ├───dto
    │       create-estudiante.dto.ts
    │       update-estudiante.dto.ts
    │
    └───pipes
            parse-optional-semester.pipe.ts
```

## Configuración

```bash
npm install
```

## Ejecutar la aplicación

```bash
npm run start
```

Modo desarrollo:

```bash
npm run start:dev
```

## Endpoints

### 1) Cursos

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | /courses | Listar cursos |
| GET | /courses/:id | Obtener curso por id |
| POST | /courses | Crear curso |
| PATCH | /courses/:id | Actualizar curso |
| DELETE | /courses/:id | Eliminar curso |

#### Ejemplo de request y response

```http
GET /courses?level=beginner
```

```json
[
  { "id": 1, "title": "NestJS Fundamentals", "level": "beginner" },
  { "id": 2, "title": "REST APIs with NestJS", "level": "beginner" }
]
```

```http
POST /courses
Content-Type: application/json
```

```json
{
  "title": "Testing in NestJS",
  "level": "advanced"
}
```

```json
{
  "id": 4,
  "title": "Testing in NestJS",
  "level": "advanced"
}
```

### 2) Estudiantes

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | /estudiantes | Listar estudiantes |
| GET | /estudiantes/:id | Obtener estudiante por id |
| POST | /estudiantes | Crear estudiante |
| PATCH | /estudiantes/:id | Actualizar estudiante |
| PATCH | /estudiantes/:id/estado | Alternar estado activo/inactivo |
| DELETE | /estudiantes/:id | Eliminar estudiante |

#### Filtros disponibles

- `career`
- `semester`
- `isActive`

```http
GET /estudiantes?career=Software Engineering&semester=2&isActive=true
```

```json
[
  {
    "id": 1,
    "name": "Alan Cedeño",
    "email": "Alan123@example.com",
    "age": 20,
    "career": "Software Engineering",
    "semester": 2,
    "isActive": true
  }
]
```

### 3) Matrículas

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | /enrollments | Crear matrícula |
| GET | /enrollments | Listar matrículas con filtros |
| GET | /students/:studentId/enrollments | Matrículas por estudiante |
| GET | /courses/:courseId/enrollments | Matrículas por curso |
| DELETE | /enrollments/:id | Cancelar matrícula |

#### Filtros disponibles

- `studentId`
- `courseId`

```http
GET /enrollments?studentId=1&courseId=2
```

```json
[
  {
    "id": 1,
    "studentId": 1,
    "courseId": 2
  }
]
```

## Demostración de casos de matrícula

### Caso 1: matrícula válida

```http
POST /enrollments
Content-Type: application/json
```

```json
{
  "studentId": 1,
  "courseId": 2
}
```

```json
{
  "id": 1,
  "studentId": 1,
  "courseId": 2
}
```

### Caso 2: matrícula duplicada

```http
POST /enrollments
Content-Type: application/json
```

```json
{
  "studentId": 1,
  "courseId": 2
}
```

```json
{
  "statusCode": 409,
  "message": "El estudiante 1 ya esta matriculado en el curso 2",
  "error": "Conflict"
}
```

### Caso 3: estudiante inactivo

```http
PATCH /estudiantes/3/estado
```

Esto cambia el estado del estudiante 3 a inactivo.

```http
POST /enrollments
Content-Type: application/json
```

```json
{
  "studentId": 3,
  "courseId": 1
}
```

```json
{
  "statusCode": 400,
  "message": "El estudiante 3 esta inactivo y no puede matricularse",
  "error": "Bad Request"
}
```

### Caso 4: identificador inexistente

```http
POST /enrollments
Content-Type: application/json
```

```json
{
  "studentId": 99,
  "courseId": 1
}
```

```json
{
  "statusCode": 404,
  "message": "El estudiante 99 no existe",
  "error": "Not Found"
}
```

## Demostración de filtros y cancelación de matrícula

### Filtros por estudiante

```http
GET /students/1/enrollments
```

```json
[
  {
    "id": 1,
    "studentId": 1,
    "courseId": 2
  }
]
```

### Filtros por curso

```http
GET /courses/2/enrollments
```

```json
[
  {
    "id": 1,
    "studentId": 1,
    "courseId": 2
  }
]
```

### Cancelación de matrícula

```http
DELETE /enrollments/1
```

```json
{
  "id": 1,
  "studentId": 1,
  "courseId": 2
}
```

Si se intenta eliminar una matrícula no existente:

```http
DELETE /enrollments/999
```

```json
{
  "statusCode": 404,
  "message": "La matricula 999 no existe",
  "error": "Not Found"
}
```

## Validaciones aplicadas

- `course`:
  - `title` obligatorio
  - `level` debe ser `beginner`, `intermediate` o `advanced`
- `estudiante`:
  - `name` obligatorio
  - `email` válido
  - `age` entre 15 y 99
  - `semester` entre 1 y 10
  - `isActive` booleano
- `enrollments`:
  - `studentId` positivo
  - `courseId` positivo
  - estudiante debe existir
  - curso debe existir
  - estudiante debe estar activo
  - no puede repetirse la misma matrícula

## Criterios de evidencia

Esta documentación cumple con lo solicitado:

- estructura final de los tres módulos
- tabla de endpoints con request y response
- demostración de matrícula válida, duplicada, inactiva y no existente
- demostración de filtros y cancelación de matrícula
- listado de rutas de carpetas del proyecto
