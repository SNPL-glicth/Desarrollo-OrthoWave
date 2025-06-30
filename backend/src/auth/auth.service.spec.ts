import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock de bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;
  let mailerService: jest.Mocked<MailerService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    nombre: 'Test',
    apellido: 'User',
    isVerified: true,
    rol: {
      id: 1,
      nombre: 'paciente',
    },
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
    mailerService = module.get(MailerService);

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('debería retornar user data cuando las credenciales son válidas', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser as any);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      // Act
      const result = await service.validateUser('test@example.com', 'password');

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(mockUser.email);
      expect(result.password).toBeUndefined(); // Password should be excluded
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['rol'],
      });
    });

    it('debería retornar null cuando el usuario no existe', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.validateUser('nonexistent@example.com', 'password');

      // Assert
      expect(result).toBeNull();
    });

    it('debería lanzar UnauthorizedException cuando el usuario no está verificado', async () => {
      // Arrange
      const unverifiedUser = { ...mockUser, isVerified: false };
      userRepository.findOne.mockResolvedValue(unverifiedUser as any);

      // Act & Assert
      await expect(
        service.validateUser('test@example.com', 'password')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debería retornar null cuando la contraseña es incorrecta', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser as any);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      // Act
      const result = await service.validateUser('test@example.com', 'wrongpassword');

      // Assert
      expect(result).toBeNull();
    });

    it('debería manejar errores de base de datos', async () => {
      // Arrange
      userRepository.findOne.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        service.validateUser('test@example.com', 'password')
      ).rejects.toThrow('Database error');
    });
  });

  describe('login', () => {
    it('debería generar un JWT token válido', async () => {
      // Arrange
      const mockToken = 'mock.jwt.token';
      jwtService.sign.mockReturnValue(mockToken);

      // Act
      const result = await service.login(mockUser);

      // Assert
      expect(result).toBeDefined();
      expect(result.access_token).toBe(mockToken);
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.rol).toBe(mockUser.rol.nombre);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        rol: mockUser.rol.nombre,
      });
    });

    it('debería incluir información del usuario en el response', async () => {
      // Arrange
      jwtService.sign.mockReturnValue('token');

      // Act
      const result = await service.login(mockUser);

      // Assert
      expect(result.user).toEqual({
        id: mockUser.id,
        nombre: mockUser.nombre,
        apellido: mockUser.apellido,
        email: mockUser.email,
        rol: mockUser.rol.nombre,
      });
    });
  });

  describe('integración', () => {
    it('debería completar el flujo de autenticación exitosamente', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser as any);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue('mock.jwt.token');

      // Act
      const validatedUser = await service.validateUser('test@example.com', 'password');
      const loginResult = await service.login(validatedUser);

      // Assert
      expect(validatedUser).toBeDefined();
      expect(loginResult.access_token).toBe('mock.jwt.token');
      expect(loginResult.user.email).toBe('test@example.com');
    });
  });
});
