import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.JWT_SECRET = 'testSecret';

describe('User (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let token: string;

  const generateUserData = () => {
    const unique = Date.now() + Math.floor(Math.random() * 1000);
    return {
      email: `test-user-${unique}@example.com`,
      password: 'password123',
      name: 'Test User',
    };
  };

  const userData = generateUserData();

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(userData)
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: userData.email,
        password: userData.password,
      })
      .expect(201);
    token = loginRes.body.token;
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('GET /user', () => {
    it('deve retornar o perfil do usuário autenticado com token válido', async () => {
      const res = await request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.email).toEqual(userData.email);
      expect(res.body.name).toEqual(userData.name);
      expect(res.body.password).toBeUndefined();
    });

    it('deve retornar 401 Unauthorized se o token estiver ausente', async () => {
      await request(app.getHttpServer())
        .get('/user')
        .expect(401);
    });

    it('deve retornar 401 Unauthorized se o token for inválido', async () => {
      await request(app.getHttpServer())
        .get('/user')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
