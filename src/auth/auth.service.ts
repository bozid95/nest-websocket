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

  // Hash password dengan bcrypt
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds); // Menambahkan saltRounds
    return bcrypt.hash(password, salt);
  }

  // Fungsi untuk membuat JWT
  private generateJwt(user: any) {
    const payload = { username: user.username, sub: user.id }; // Payload yang bisa Anda sesuaikan
    return this.jwtService.sign(payload); // Menggunakan JwtService untuk menghasilkan token
  }

  // Fungsi untuk register
  async register(registerDto: RegisterDto) {
    const { username, password, gender } = registerDto;

    // Memastikan bahwa username belum digunakan
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

    // Generate and return JWT after user registration
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

    // Compare password with the hashed one in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Return JWT if login is successful
    return this.generateJwt(user);
  }
}
