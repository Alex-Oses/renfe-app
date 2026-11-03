import { centimosViajero } from './precio.js';

describe('centimosViajero', () => {
  it('cobra el precio base al adulto sin tarifa ni descuento', () => {
    expect(centimosViajero(5000)).toBe(5000);
  });

  it('el niño paga un 40 % menos', () => {
    expect(centimosViajero(5000, 'nino')).toBe(3000);
  });

  it('no acumula niño y tarjeta: gana el mayor', () => {
    expect(centimosViajero(10000, 'nino', 'basico', 'joven')).toBe(6000);
    expect(centimosViajero(10000, 'nino', 'basico', 'fn-especial')).toBe(5000);
  });

  it('aplica el factor de la tarifa antes del descuento', () => {
    expect(centimosViajero(4400, 'adulto', 'elige', 'joven')).toBe(3850);
  });
});
