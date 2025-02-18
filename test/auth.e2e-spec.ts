import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.JWT_SECRET = 'testSecret';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  const generateUserData = () => {
    const unique = Date.now() + Math.floor(Math.random() * 1000);
    return {
      email: `test-auth-${unique}@example.com`,
      password: 'strongpassword',
      name: 'Test Auth User',
    };
  };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('POST /auth/signup', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const userData = generateUserData();
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(userData)
        .expect(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.email).toEqual(userData.email);
      expect(res.body.name).toEqual(userData.name);
      expect(res.body.password).toBeUndefined();
    });

    it('não deve permitir registro com email duplicado', async () => {
      const userData = generateUserData();
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(userData)
        .expect(201);
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(userData)
        .expect(409);
    });

    it('deve retornar erro de validação para campos em branco', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: '', password: '', name: '' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('deve logar com sucesso e retornar um token JWT', async () => {
      const userData = generateUserData();
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(userData)
        .expect(201);
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(201);
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
    });

    it('não deve logar com credenciais inválidas', async () => {
      const userData = generateUserData();
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(userData)
        .expect(201);
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('deve retornar erro para email em branco', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: '',
          password: 'somepassword',
        })
        .expect(400);
    });

    it('deve retornar erro para senha em branco', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'someemail@example.com',
          password: '',
        })
        .expect(400);
    });
  });
});
