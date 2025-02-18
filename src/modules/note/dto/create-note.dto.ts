import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ example: 'Título da nota' })
  @IsNotEmpty({ message: 'O título é obrigatório.' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Descrição da nota', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
