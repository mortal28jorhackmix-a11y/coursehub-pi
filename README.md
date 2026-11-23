# CourseHub API

API REST desarrollada con NestJS para administrar cursos, estudiantes e inscripciones. Utiliza PostgreSQL como base de datos, TypeORM para el acceso a datos y `class-validator` para validar las solicitudes.

## Funcionalidades

- Gestión de cursos, incluyendo consulta por nivel, paginación y ordenamiento.
- Gestión de estudiantes, con filtros por carrera, semestre y estado.
- Gestión de inscripciones entre estudiantes y cursos.
- Búsqueda de inscripciones por nombre de estudiante o título de curso, filtros por estudiante, curso y estado activo, y paginación.
- Validación global de los datos recibidos y respuestas HTTP de error para solicitudes inválidas o recursos inexistentes.
- Prevención de inscripciones duplicadas y de inscripciones de estudiantes inactivos.

## Requisitos

- Node.js 22 LTS y npm. Instala Node.js.
- PostgreSQL instalado , y una base de datos para el proyecto (por ejemplo, `coursehub`).

## Variables de entorno

La aplicación requiere estas variables para conectarse a PostgreSQL:

| Variable | Requerida | Valor de ejemplo |
| --- | --- | --- |
| `DB_HOST` | Sí | `localhost` |
| `DB_PORT` | No; por defecto `5432` | `5432` |
| `DB_NAME` | Sí | `coursehub` |
| `DB_USER` | Sí | `postgres` |
| `DB_PASSWORD` | Sí; puede estar vacía | `tu_clave` |
| `PORT` | No; por defecto `3000` | `3000` |
| `NODE_ENV` | No; por defecto `development` | `development` |
| `JWT_SECRET` | Sí; mínimo 32 caracteres | Secreto generado localmente |
| `JWT_EXPIRES_IN` | No; por defecto `1h` | `1h` |

Antes de iniciar el proyecto, crea un archivo `.env` en la raíz con estas variables. Usa un secreto aleatorio propio para `JWT_SECRET` y actualiza las credenciales de PostgreSQL:

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_NAME=coursehub
DB_USER=postgres
DB_PASSWORD=tu_clave
JWT_SECRET=usa_un_secreto_aleatorio_de_32_caracteres_o_mas
JWT_EXPIRES_IN=1h
```

## Inicio en desarrollo

Instala las dependencias e inicia la API:

```bash
npm install
npm run start:dev
```


La API escucha en `http://localhost:3000` por defecto. El puerto se puede cambiar mediante `PORT`.

## Endpoints y consultas de la Semana 6

Los ejemplos usan `curl` y presuponen que la API está ejecutándose localmente en el puerto `3000`.

### Cursos

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/courses` | Lista cursos con filtros, paginación y ordenamiento. |
| `GET` | `/courses/:id` | Obtiene un curso por ID. |
| `POST` | `/courses` | Crea un curso. |
| `PATCH` | `/courses/:id` | Actualiza el título o nivel de un curso. |
| `DELETE` | `/courses/:id` | Elimina un curso. |

Parámetros opcionales de `GET /courses`:

| Parámetro | Descripción |
| --- | --- |
| `level` | Filtra por nivel: `beginner`, `intermediate` o `advanced`. |
| `page` | Página solicitada; empieza en `1` y por defecto es `1`. |
| `limit` | Resultados por página, entre `1` y `50`; por defecto `10`. |
| `sortBy` | Campo de orden: `id`, `title` o `level`; por defecto `id`. |
| `order` | Dirección `ASC` o `DESC`; por defecto `ASC`. |

La respuesta de listado contiene `items` y `meta`, con `total`, `page`, `limit` y `totalPages`. Consulta de ejemplo con filtro, paginación y ordenamiento:

```bash
curl "http://localhost:3000/courses?level=beginner&page=1&limit=10&sortBy=title&order=ASC"
```

Ejemplo de cuerpo para crear un curso:

```json
{
  "title": "Introducción a NestJS",
  "level": "beginner"
}
```

La creación y actualización de cursos requieren un token Bearer de un usuario `teacher` o `admin`; cada docente solo puede actualizar sus propios cursos. La eliminación requiere el rol `admin`.

### Estudiantes

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/estudiantes` | Lista estudiantes; admite filtros por carrera, semestre y estado activo. |
| `GET` | `/estudiantes/:id` | Obtiene un estudiante por ID. |
| `POST` | `/estudiantes` | Crea un estudiante. |
| `PATCH` | `/estudiantes/:id` | Actualiza los datos de un estudiante. |
| `PATCH` | `/estudiantes/:id/estado` | Alterna el estado activo/inactivo. |
| `DELETE` | `/estudiantes/:id` | Elimina un estudiante activo. |

Parámetros opcionales de `GET /estudiantes`: `career`, `semester` e `isActive` (`true` o `false`). Ejemplo de consulta combinando filtros:

```bash
curl "http://localhost:3000/estudiantes?career=Ingenieria&semester=3&isActive=true"
```

No se permite eliminar estudiantes inactivos y el correo electrónico debe ser único.

### Inscripciones

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/enrollments` | Inscribe a un estudiante en un curso. |
| `GET` | `/enrollments` | Busca y lista inscripciones con filtros y paginación. |
| `GET` | `/students/:studentId/enrollments` | Lista las inscripciones de un estudiante. |
| `GET` | `/courses/:courseId/enrollments` | Lista las inscripciones de un curso. |
| `DELETE` | `/enrollments/:id` | Elimina una inscripción. |

Parámetros opcionales de `GET /enrollments`:

| Parámetro | Descripción |
| --- | --- |
| `search` | Busca parcialmente, sin distinguir mayúsculas, por nombre de estudiante o título del curso. |
| `studentId` | Filtra por ID de estudiante. |
| `courseId` | Filtra por ID de curso. |
| `activeOnly` | Con `true`, limita los resultados a estudiantes activos. |
| `page` | Página solicitada; empieza en `1` y por defecto es `1`. |
| `limit` | Resultados por página, entre `1` y `50`; por defecto `10`. |

La búsqueda textual utiliza `ILIKE` de PostgreSQL. La respuesta de listado contiene `items` y `meta`, con `total`, `page` y `limit`. Ejemplo de consulta por nombre o título, limitada a estudiantes activos y paginada:

```bash
curl "http://localhost:3000/enrollments?search=ana&activeOnly=true&page=1&limit=10"
```

Ejemplo de cuerpo para crear una inscripción:

```json
{
  "studentId": 1,
  "courseId": 1
}
```

Una inscripción requiere que existan tanto el estudiante como el curso; el estudiante debe estar activo y no puede estar ya inscrito en ese curso.

## Validación y errores

La aplicación aplica un `ValidationPipe` global que transforma los valores de entrada, elimina propiedades no declaradas y rechaza solicitudes que incluyan propiedades adicionales. Los errores se devuelven con los códigos HTTP correspondientes; por ejemplo, `400` para datos inválidos, `404` para recursos inexistentes y `409` para conflictos como correos o inscripciones duplicados.

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm run start:dev` | Inicia la aplicación en modo desarrollo con recarga automática. |
| `npm run build` | Compila la aplicación. |
| `npm run start:prod` | Inicia la aplicación compilada. |
| `npm test` | Ejecuta las pruebas unitarias. |
| `npm run test:e2e` | Ejecuta las pruebas end-to-end. |
| `npm run lint` | Analiza el código fuente y las pruebas. |
| `npm run format` | Formatea los archivos TypeScript de `src/` y `test/`. |

## Semana 12 · Sesiones 23 y 24: pruebas unitarias

Estas sesiones practican pruebas unitarias que protegen reglas de negocio y verifican que los controladores deleguen correctamente. El proyecto ejecuta Vitest; los ejemplos de la guía que usan Jest se adaptan con `vi.fn()` y `vi.clearAllMocks()`.

### Sesión 23 · Reglas de negocio

La prueba de `UpdateCourseUseCase` está en `src/courses/use-cases/update-course.use-case.spec.ts`. Usa un repositorio simulado inyectado mediante `COURSE_REPOSITORY`, por lo que no abre una conexión a PostgreSQL ni realiza solicitudes de red.

Los casos cubiertos son:

- El docente propietario puede actualizar su curso y el repositorio guarda el resultado.
- La actualización se rechaza con `ForbiddenException` cuando otro docente intenta modificar el curso; el repositorio no guarda cambios.
- La actualización se rechaza con `NotFoundException` cuando el curso no existe; el repositorio no guarda cambios.

Ejecuta solo estas pruebas con:

```bash
npm test -- src/courses/use-cases/update-course.use-case.spec.ts
```

### Sesión 24 · Controlador y cobertura

La prueba de `CoursesController` está en `src/courses/courses.controller.spec.ts`. Simula `UpdateCourseUseCase` y verifica que el método `update` delegue el identificador, el DTO y el usuario autenticado.

```bash
npm test -- src/courses/courses.controller.spec.ts
```

Para ejecutar toda la suite unitaria:

```bash
npm test
```

Para generar el reporte de cobertura:

```bash
npm test -- --coverage
```

La cobertura sirve para encontrar código o ramas que aún no ejecutan las pruebas; el porcentaje no es un objetivo por sí solo. Conviene priorizar pruebas que expresen comportamientos y reglas importantes.

### Demostración de la regla de autorización

Con la regla original, ejecuta primero toda la suite con `npm test`. Después, cambia temporalmente en `src/courses/use-cases/update-course.use-case.ts` la condición de propiedad `course.createdByUserId !== actor.id` por `course.createdByUserId === actor.id` y ejecuta:

```bash
npm test -- src/courses/use-cases/update-course.use-case.spec.ts
```

La prueba del docente propietario debe fallar porque la regla temporal invierte quién tiene permiso. Restaura inmediatamente la condición original (`!==`) y vuelve a ejecutar `npm test`; la suite debe pasar otra vez. No dejes la regla temporal en el código.

Si se elimina la prueba de autorización rechazada, queda desprotegido el comportamiento que impide a un docente modificar el curso de otra persona.

### Capturas para la evidencia

- El archivo de prueba del caso de uso, mostrando el repositorio simulado y los tres escenarios; si no caben legibles en una pantalla, usa más de una captura.
- La terminal con los tres casos del caso de uso aprobados.
- El archivo de prueba del controlador y la terminal con su prueba aprobada.
- El README mostrando los comandos y la nota de que las pruebas unitarias no necesitan PostgreSQL ni red.
- La ejecución completa de `npm test`, la falla esperada durante la mutación temporal y la ejecución exitosa después de restaurar la regla.

sesion 20 
 (Semana 10)

Esta API implementa una estrategia de **defensa en profundidad** que incluye:
- **CORS:** Restringido a los orígenes autorizados del cliente web en `src/main.ts`.
- **Rate Limiting:** Protección global mediante `@nestjs/throttler` (20 peticiones por minuto por defecto) y un límite estricto de **5 intentos por minuto** en el endpoint de autenticación (`POST /auth/login`) para prevenir ataques de fuerza bruta[cite: 1, 4].
- **Validación y Tipos:** Uso estricto de DTOs con `ValidationPipe` para rechazar cuerpos malformados o datos no permitidos.
- **HTTPS y Producción:** En entornos de producción, la terminación TLS (HTTPS) debe configurarse en el balanceador de carga o proxy inverso para proteger los tokens Bearer y credenciales en tránsito[cite: 1]. Las credenciales y secretos (`JWT_SECRET`, credenciales de base de datos) se gestionan exclusivamente mediante variables de entorno validadas con Joi.


## Semana 12 · Sesiones 23 y 24: pruebas unitarias

Estas sesiones practican pruebas unitarias que protegen reglas de negocio y verifican que los controladores deleguen correctamente. El proyecto ejecuta Vitest; los ejemplos de la guía que usan Jest se adaptan con `vi.fn()` y `vi.clearAllMocks()`.

### Sesión 23 · Reglas de negocio

La prueba de `UpdateCourseUseCase` está en `src/courses/use-cases/update-course.use-case.spec.ts`. Usa un repositorio simulado inyectado mediante `COURSE_REPOSITORY`, por lo que no abre una conexión a PostgreSQL ni realiza solicitudes de red.

Los casos cubiertos son:

- El docente propietario puede actualizar su curso y el repositorio guarda el resultado.
- La actualización se rechaza con `ForbiddenException` cuando otro docente intenta modificar el curso; el repositorio no guarda cambios.
- La actualización se rechaza con `NotFoundException` cuando el curso no existe; el repositorio no guarda cambios.

Ejecuta solo estas pruebas con:

```bash
npm test -- src/courses/use-cases/update-course.use-case.spec.ts
```

### Sesión 24 · Controlador y cobertura

La prueba de `CoursesController` está en `src/courses/courses.controller.spec.ts`. Simula `UpdateCourseUseCase` y verifica que el método `update` delegue el identificador, el DTO y el usuario autenticado.

```bash
npm test -- src/courses/courses.controller.spec.ts
```

Para ejecutar toda la suite unitaria:

```bash
npm test
```

Para generar el reporte de cobertura:

```bash
npm test -- --coverage
```

La cobertura sirve para encontrar código o ramas que aún no ejecutan las pruebas; el porcentaje no es un objetivo por sí solo. Conviene priorizar pruebas que expresen comportamientos y reglas importantes.

### Demostración de la regla de autorización

Con la regla original, ejecuta primero toda la suite con `npm test`. Después, cambia temporalmente en `src/courses/use-cases/update-course.use-case.ts` la condición de propiedad `course.createdByUserId !== actor.id` por `course.createdByUserId === actor.id` y ejecuta:

```bash
npm test -- src/courses/use-cases/update-course.use-case.spec.ts
```

La prueba del docente propietario debe fallar porque la regla temporal invierte quién tiene permiso. Restaura inmediatamente la condición original (`!==`) y vuelve a ejecutar `npm test`; la suite debe pasar otra vez. No dejes la regla temporal en el código.

Si se elimina la prueba de autorización rechazada, queda desprotegido el comportamiento que impide a un docente modificar el curso de otra persona.

## Pruebas unitarias

Ejecuta todas las pruebas unitarias con:

```bash
npm test