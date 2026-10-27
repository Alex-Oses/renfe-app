import { duracionMin, intervaloAIso } from './tiempo.js';

describe('intervaloAIso', () => {
  it('convierte una hora normal al offset de invierno', () => {
    expect(intervaloAIso('2026-11-02', '07:15:00')).toBe('2026-11-02T07:15:00+01:00');
  });

  it('usa el offset de verano en verano', () => {
    expect(intervaloAIso('2026-07-15', '07:15:00')).toBe('2026-07-15T07:15:00+02:00');
  });

  it('cambia de offset al pasar el último domingo de octubre', () => {
    expect(intervaloAIso('2026-10-24', '12:00:00')).toBe('2026-10-24T12:00:00+02:00');
    expect(intervaloAIso('2026-10-26', '12:00:00')).toBe('2026-10-26T12:00:00+01:00');
  });

  it('pasa al día siguiente cuando la hora es mayor que 24', () => {
    expect(intervaloAIso('2026-11-02', '25:10:00')).toBe('2026-11-03T01:10:00+01:00');
  });

  it('trata 24:00 como medianoche del día siguiente', () => {
    expect(intervaloAIso('2026-11-02', '24:00:00')).toBe('2026-11-03T00:00:00+01:00');
  });

  it('acepta el cambio de mes y de año', () => {
    expect(intervaloAIso('2026-12-31', '26:30:00')).toBe('2027-01-01T02:30:00+01:00');
  });

  it('rellena segundos cuando el intervalo no los trae', () => {
    expect(intervaloAIso('2026-11-02', '07:15')).toBe('2026-11-02T07:15:00+01:00');
  });
});

describe('duracionMin', () => {
  it('calcula la diferencia entre dos horas del mismo día de servicio', () => {
    expect(duracionMin('07:15:00', '09:40:00')).toBe(145);
  });

  it('funciona cruzando la medianoche', () => {
    expect(duracionMin('23:30:00', '25:10:00')).toBe(100);
  });
});
