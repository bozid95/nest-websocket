import { Gender } from '@prisma/client';

export class RegisterDto {
  username: string;
  password: string;
  gender: Gender;
}
