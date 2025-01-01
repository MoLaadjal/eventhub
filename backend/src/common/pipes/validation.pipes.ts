import {
  PipeTransform,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';

export class CustomValidationPipe
  extends ValidationPipe
  implements PipeTransform<any>
{
  constructor() {
    super({
      whitelist: true, // Supprime les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Rejette les requêtes contenant des propriétés non définies
      transform: true, // Active la transformation automatique
      transformOptions: {
        enableImplicitConversion: true, // Convertit automatiquement les types
      },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => ({
          field: error.property,
          constraints: Object.values(error.constraints || {}),
        }));

        throw new BadRequestException({
          message: 'Erreur de validation',
          errors: messages,
        });
      },
    });
  }
}
