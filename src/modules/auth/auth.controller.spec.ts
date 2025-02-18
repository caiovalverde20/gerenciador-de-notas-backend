import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('deve chamar authService.signup e retornar o resultado', async () => {
      const dto: CreateUserDto = {
        email: 'teste@exemplo.com',
        password: 'senha123',
        name: 'Usuário Teste',
      };
      const expectedResult = { id: '123', ...dto };
      mockAuthService.signup.mockResolvedValue(expectedResult);

      const result = await authController.signup(dto);
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.signup).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('deve chamar authService.login e retornar um token JWT quando as credenciais são válidas', async () => {
      const dto: LoginDto = {
        email: 'teste@exemplo.com',
        password: 'senha123',
      };
      const expectedResult = { token: 'jwt-token-exemplo' };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await authController.login(dto);
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto.email, dto.password);
    });

    it('deve lançar UnauthorizedException se as credenciais forem inválidas', async () => {
      const dto: LoginDto = {
        email: 'invalido@exemplo.com',
        password: 'senhaerrada',
      };
      mockAuthService.login.mockRejectedValueOnce(
        new UnauthorizedException('Credenciais inválidas.')
      );

      await expect(authController.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto.email, dto.password);
    });

    it('deve lançar erro se o email estiver em branco', async () => {
      const dto: LoginDto = {
        email: '',
        password: 'senha123',
      };
      mockAuthService.login.mockRejectedValueOnce(
        new UnauthorizedException('O email não pode estar em branco.')
      );

      await expect(authController.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto.email, dto.password);
    });

    it('deve lançar erro se a senha estiver em branco', async () => {
      const dto: LoginDto = {
        email: 'teste@exemplo.com',
        password: '',
      };
      mockAuthService.login.mockRejectedValueOnce(
        new UnauthorizedException('A senha não pode estar em branco.')
      );

      await expect(authController.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto.email, dto.password);
    });
  });
});
