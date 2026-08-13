import { test, expect, describe } from 'vitest';
const { computeRankings } = require('../Routes/ambianceRouter');

describe('computeRankings de la route get quiethours', () => {
  test('retourne un tableau vide quand il n\'y a aucune mesure', () => {
    expect(computeRankings([])).toEqual([]);
  });
 
  test('regroupe par heure, calcule la moyenne et trie par ordre croissant', () => {
    const measurements = [
      { timestamp: new Date('2025-01-01T10:15:00'), value: 40 },
      { timestamp: new Date('2025-01-01T10:45:00'), value: 60 },
      { timestamp: new Date('2025-01-01T05:00:00'), value: 30 },
    ];
 
    expect(computeRankings(measurements)).toEqual([
      { hourSlot24h: 5, averageSoundDb: 30, sampleDensity: 1 },
      { hourSlot24h: 10, averageSoundDb: 50, sampleDensity: 2 },
    ]);
  });
 
  test('arrondit la moyenne à 2 décimales', () => {
    // (10 + 10 + 11) / 3 = 10.333 doit être arrondi à 10.33
    const measurements = [
      { timestamp: new Date('2025-01-01T08:00:00'), value: 10 },
      { timestamp: new Date('2025-01-01T08:10:00'), value: 10 },
      { timestamp: new Date('2025-01-01T08:20:00'), value: 11 },
    ];
 
    const result = computeRankings(measurements);
    expect(result[0].averageSoundDb).toBe(10.33);
    expect(result[0].sampleDensity).toBe(3);
  });
});