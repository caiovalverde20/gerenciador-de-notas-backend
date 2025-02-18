import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Request } from 'express';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  const mockUserService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    userController = moduleRef.get<UserController>(UserController);
    userService = moduleRef.get<UserService>(UserService);
  });

  describe('getProfile', () => {
    it('deve retornar o usuário autenticado a partir do userService.findById', async () => {
      const fakeUser = { userId: '123' };
      const req = { user: fakeUser } as unknown as Request;

      const expectedUser = {
        id: '123',
        email: 'teste@exemplo.com',
        name: 'Usuário Teste',
      };

      mockUserService.findById.mockResolvedValue(expectedUser);

      const result = await userController.getProfile(req);
      expect(result).toEqual(expectedUser);
      expect(mockUserService.findById).toHaveBeenCalledWith(fakeUser.userId);
    });

    it('deve lançar erro se a propriedade user não existir na requisição', async () => {
      const req = {} as Request;
      await expect(userController.getProfile(req)).rejects.toThrow();
    });
  });
});
