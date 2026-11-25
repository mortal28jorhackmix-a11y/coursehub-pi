import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { User } from '../src/users/entities/user.entity.js';
import { UserRole } from '../src/users/user-role.enum.js';

describe('CourseHub API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const teacherEmail = 'teacher.e2e@example.test';
  const teacherPassword = 'coursehub-e2e-password';

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
    await app.init();

    dataSource = app.get(DataSource);

    const databaseName = String(dataSource.options.database ?? '');
    if (!databaseName.endsWith('_test')) {
      await app.close();
      throw new Error(
        `La base e2e debe terminar en "_test"; se recibió "${databaseName}".`,
      );
    }
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE "enrollments", "students", "courses", "users" RESTART IDENTITY CASCADE',
    );

    await dataSource.getRepository(User).save({
      email: teacherEmail,
      passwordHash: await bcrypt.hash(teacherPassword, 4),
      role: UserRole.TEACHER,
    });
  });

  it('GET /courses responde con la lista y sus metadatos', async () => {
    await request(app.getHttpServer())
      .get('/courses')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({
          items: expect.any(Array),
          meta: expect.objectContaining({
            total: expect.any(Number),
            page: 1,
            limit: 10,
            totalPages: expect.any(Number),
          }),
        });
      });
  });

  it('POST /courses permite crear con un token de docente', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: teacherEmail, password: teacherPassword })
      .expect(200);

    await request(app.getHttpServer())
      .post('/courses')
      .set('Authorization', `Bearer ${login.body.accessToken as string}`)
      .send({ title: 'Curso e2e', level: 'beginner' })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            id: expect.any(Number),
            title: 'Curso e2e',
            level: 'beginner',
          }),
        );
      });
  });

  it('POST /courses rechaza solicitudes sin token', async () => {
    await request(app.getHttpServer())
      .post('/courses')
      .send({ title: 'Curso sin token', level: 'beginner' })
      .expect(401);
  });

  afterAll(async () => {
    await app?.close();
  });
});