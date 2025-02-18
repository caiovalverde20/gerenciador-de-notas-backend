import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'usuario@exemplo.com', description: 'Email do usuário' })
  @IsEmail({}, { message: 'Email inválido.' })
  email: string;

  @ApiProperty({ example: 'senhaForte123', description: 'Senha do usuário' })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  password: string;
}
