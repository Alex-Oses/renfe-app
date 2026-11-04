import { calcularDesglose, precioExtra, precioViajero } from './precios.js';

describe('precioViajero', () => {
  it('sin tarifa ni descuento deja el precio del asiento', () => {
    expect(precioViajero(20)).toBe(20);
  });

  it('aplica el factor de la tarifa', () => {
    expect(precioViajero(20, 'premium')).toBe(38);
  });

  it('aplica el mayor entre niño y descuento', () => {
    expect(precioViajero(20, 'basico', 'nino', 'joven')).toBe(12);
    expect(precioViajero(20, 'basico', 'nino', 'fn-especial')).toBe(10);
  });

  it('el bebé no paga', () => {
    expect(precioViajero(20, 'premium', 'bebe', 'dorada')).toBe(0);
  });
});

describe('precioExtra', () => {
  it('multiplica solo los extras por viajero', () => {
    expect(precioExtra('equipaje', 3)).toBe(15);
    expect(precioExtra('seguro', 3)).toBe(7.5);
  });

  it('la comida va incluida en prémium', () => {
    expect(precioExtra('comida', 2, 'premium')).toBe(0);
    expect(precioExtra('comida', 2)).toBe(24);
  });
});

describe('calcularDesglose', () => {
  it('sin extras ni tarifa es el precio del asiento por butaca', () => {
    expect(calcularDesglose({ precioAsiento: 20, tipos: ['adulto', 'adulto'] })).toEqual({
      billetes: 40,
      extras: 0,
      total: 40,
    });
  });

  it('suma billetes y extras, sin repetir un extra pedido dos veces', () => {
    expect(
      calcularDesglose({
        precioAsiento: 20,
        tipos: ['adulto', 'nino'],
        tarifa: 'elige',
        extras: ['equipaje', 'equipaje', 'seguro'],
      }),
    ).toEqual({ billetes: 40, extras: 20, total: 60 });
  });
});
