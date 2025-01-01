import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email doit être une adresse email valide' })
  @Transform(({ value }: TransformFnParams) => value?.toLowerCase().trim())
  email: string;

  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
  @MaxLength(50, { message: 'Le prénom ne peut pas dépasser 50 caractères' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  firstName: string;

  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(50, { message: 'Le nom ne peut pas dépasser 50 caractères' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  lastName: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @MaxLength(50, {
    message: 'Le mot de passe ne peut pas dépasser 50 caractères',
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
  })
  password: string;

  @IsOptional()
  @IsArray({ message: 'Les rôles doivent être un tableau' })
  @ArrayMaxSize(3, {
    message: 'Un utilisateur ne peut pas avoir plus de 3 rôles',
  })
  @IsString({
    each: true,
    message: 'Chaque rôle doit être une chaîne de caractères',
  })
  roles?: string[];
}
