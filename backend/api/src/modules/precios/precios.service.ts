import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { BdService } from '../../common/bd/bd.service.js';
import { precioAsientoDe } from '../../common/simulado/precio-trayecto.js';
import { calcularDesglose, type Desglose } from '../../common/simulado/precios.js';
import type { CalcularPreciosDto } from './dto/calcular-precios.dto.js';

@Injectable()
export class PreciosService {
  constructor(private readonly bd: BdService) {}

  async calcular(dto: CalcularPreciosDto): Promise<{ precioAsiento: number; desglose: Desglose }> {
    let precioAsiento: number | null;
    try {
      precioAsiento = await this.bd.transaccion((cliente) => precioAsientoDe(cliente, dto));
    } catch {
      throw new ServiceUnavailableException('La base de datos no está disponible');
    }
    if (precioAsiento === null) {
      throw new NotFoundException('Ese viaje no circula en esa fecha o el trayecto no existe');
    }
    return {
      precioAsiento,
      desglose: calcularDesglose({
        precioAsiento,
        tipos: dto.pasajeros.map((p) => p.tipo ?? 'adulto'),
        tarifa: dto.tarifa,
        descuento: dto.descuento,
        extras: dto.extras,
      }),
    };
  }
}
