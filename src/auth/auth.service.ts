import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Fungsi untuk membuat hash password
  private saltRounds: number = 10;

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return bcrypt.hash(password, salt);
  }

  // Fungsi untuk membuat JWT
  private generateJwt(user: any) {
    const payload = { username: user.username, sub: user.id };
    return this.jwtService.sign(payload);
  }

  // Fungsi untuk register
  async register(registerDto: RegisterDto) {
    const { username, password, gender } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('Username is already taken');
    }

    // Hash password before saving to the database
    const hashedPassword = await this.hashPassword(password);

    // Create the new user in the database
    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        gender,
      },
    });

    return this.generateJwt(user);
  }

  // Fungsi untuk login
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Check if the user exists
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Return JWT if login is successful
    return this.generateJwt(user);
  }
}
