import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: any) {
    return this.userService.create(createUserDto);
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    const user = await this.userService.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    const payload = { sub: user._id, email: user.email };
    const token = this.jwtService.sign(payload);
    return { token };
  }
}
