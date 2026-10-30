import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ValidarBilleteDto {
  @ApiProperty({
    description: 'Contenido del QR escaneado: `RNF1.…` (billete) o `RNA1.…` (abono)',
    example: 'RNF1.eyJ2IjoxLCJpZCI6…',
  })
  @IsString()
  @Length(10, 4000)
  qr!: string;
}
