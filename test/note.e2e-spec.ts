import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types } from 'mongoose';

jest.setTimeout(30000);
process.env.JWT_SECRET = 'testSecret';

describe('Note (e2e)', () => {
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

  const generateNoteData = () => {
    const unique = Date.now() + Math.floor(Math.random() * 1000);
    return {
      title: `Test Note ${unique}`,
      description: 'Test Description',
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

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(userData)
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userData.email, password: userData.password })
      .expect(201);
    token = loginRes.body.token;
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('POST /notes', () => {
    it('deve criar uma nota com sucesso', async () => {
      const noteData = generateNoteData();
      const res = await request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(noteData)
        .expect(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toEqual(noteData.title);
      expect(res.body.description).toEqual(noteData.description);
      expect(res.body.favorite).toEqual(false);
    });

    it('não deve criar nota com título em branco', async () => {
      const noteData = { title: '', description: 'Some description' };
      await request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(noteData)
        .expect(400);
    });
  });

  describe('GET /notes', () => {
    it('deve listar todas as notas do usuário', async () => {
      const res = await request(app.getHttpServer())
        .get('/notes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('Com nota existente', () => {
    let noteId: string;

    beforeEach(async () => {
      const noteData = generateNoteData();
      const res = await request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(noteData)
        .expect(201);
      noteId = res.body._id;
    });

    describe('GET /notes/:id', () => {
      it('deve retornar uma nota específica', async () => {
        const res = await request(app.getHttpServer())
          .get(`/notes/${noteId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
        expect(res.body).toHaveProperty('_id', noteId);
      });

      it('deve retornar 404 se a nota não existir', async () => {
        const nonExistingId = new Types.ObjectId().toHexString();
        await request(app.getHttpServer())
          .get(`/notes/${nonExistingId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
      });

      it('deve retornar 404 para id inválido', async () => {
        await request(app.getHttpServer())
          .get('/notes/1')
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
      });
    });

    describe('PATCH /notes/:id', () => {
      it('deve atualizar uma nota', async () => {
        const updatedData = { title: 'Updated Title', description: 'Updated Description' };
        const res = await request(app.getHttpServer())
          .patch(`/notes/${noteId}`)
          .set('Authorization', `Bearer ${token}`)
          .send(updatedData)
          .expect(200);
        expect(res.body.title).toEqual(updatedData.title);
        expect(res.body.description).toEqual(updatedData.description);
      });

      it('deve retornar 404 ao tentar atualizar nota inexistente', async () => {
        const updatedData = { title: 'Updated Title', description: 'Updated Description' };
        const nonExistingId = new Types.ObjectId().toHexString();
        await request(app.getHttpServer())
          .patch(`/notes/${nonExistingId}`)
          .set('Authorization', `Bearer ${token}`)
          .send(updatedData)
          .expect(404);
      });

      it('deve retornar 404 para id inválido ao atualizar', async () => {
        const updatedData = { title: 'Updated Title', description: 'Updated Description' };
        await request(app.getHttpServer())
          .patch('/notes/1')
          .set('Authorization', `Bearer ${token}`)
          .send(updatedData)
          .expect(404);
      });
    });

    describe('DELETE /notes/:id', () => {
      it('deve excluir uma nota', async () => {
        const res = await request(app.getHttpServer())
          .delete(`/notes/${noteId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
        expect(res.body).toHaveProperty('_id', noteId);
      });

      it('deve retornar 404 ao tentar excluir nota inexistente', async () => {
        await request(app.getHttpServer())
          .delete(`/notes/${noteId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
        await request(app.getHttpServer())
          .delete(`/notes/${noteId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
      });

      it('deve retornar 404 para id inválido ao excluir', async () => {
        await request(app.getHttpServer())
          .delete('/notes/1')
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
      });
    });

    describe('POST /notes/:id/favorite', () => {
      it('deve alternar o status de favorito (de false para true)', async () => {
        const res1 = await request(app.getHttpServer())
          .post(`/notes/${noteId}/favorite`)
          .set('Authorization', `Bearer ${token}`)
          .expect(201);
        expect(res1.body.favorite).toEqual(true);
      });

      it('deve alternar o status de favorito (de true para false)', async () => {
        await request(app.getHttpServer())
          .post(`/notes/${noteId}/favorite`)
          .set('Authorization', `Bearer ${token}`)
          .expect(201);
        const res2 = await request(app.getHttpServer())
          .post(`/notes/${noteId}/favorite`)
          .set('Authorization', `Bearer ${token}`)
          .expect(201);
        expect(res2.body.favorite).toEqual(false);
      });

      it('deve retornar 404 para id inválido ao alternar favorito', async () => {
        await request(app.getHttpServer())
          .post('/notes/1/favorite')
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
      });

      it('deve retornar 404 se a nota não existir ao alternar favorito', async () => {
        const nonExistingId = new Types.ObjectId().toHexString();
        await request(app.getHttpServer())
          .post(`/notes/${nonExistingId}/favorite`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
      });
    });
  });

  describe('Controle de acesso', () => {
    let noteId: string;

    beforeEach(async () => {
      const noteData = generateNoteData();
      const res = await request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(noteData)
        .expect(201);
      noteId = res.body._id;
    });

    it('não deve permitir que outro usuário atualize nota que não lhe pertence', async () => {
      const newUserData = generateUserData();
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(newUserData)
        .expect(201);
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: newUserData.email, password: newUserData.password })
        .expect(201);
      const newToken = loginRes.body.token;
      const updatedData = { title: 'Hacked Title', description: 'Hacked Description' };
      await request(app.getHttpServer())
        .patch(`/notes/${noteId}`)
        .set('Authorization', `Bearer ${newToken}`)
        .send(updatedData)
        .expect(404);
    });
  });
});
