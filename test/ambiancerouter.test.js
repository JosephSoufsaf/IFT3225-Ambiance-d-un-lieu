import { test, expect, describe } from 'vitest';
const { computeRankings, calculateTimeOffset, classifyNoise } = require('../Routes/ambianceRouter');

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

describe('Calcul du temps depuis la dernière query (timeOffset)', () => {
     
    test('parse les jours ("2d") en millisecondes', () => {
        expect(calculateTimeOffset('2d')).toBe(2 * 24 * 60 * 60 * 1000);
    });

    test('accepte les valeurs décimales ("1.5h")', () => {
        expect(calculateTimeOffset('1.5h')).toBe(1.5 * 60 * 60 * 1000);
    });

    test('traite un nombre sans unité comme des heures ("5")', () => {
        expect(calculateTimeOffset('5')).toBe(5 * 60 * 60 * 1000);
    });

    test('retombe sur la valeur par défaut (3h) si le format est invalide', () => {
        expect(calculateTimeOffset('abc')).toBe(3 * 60 * 60 * 1000);
    });

});

describe('Classification du bruit de la route get portrait', () => {

    test('classe en dessous de 30 comme "Très Calme"', () => {
        expect(classifyNoise(0)).toBe('Très Calme');
        expect(classifyNoise(15)).toBe('Très Calme');
    });
 
    test('classe entre 30 et 39 inclusivement comme "Calme"', () => {
        expect(classifyNoise(30)).toBe('Calme');
        expect(classifyNoise(35)).toBe('Calme');
    });
 
    test('classe entre 40 et 50 inclusivement comme "Modéré"', () => {
        expect(classifyNoise(45)).toBe('Modéré');
        expect(classifyNoise(50)).toBe('Modéré'); // 50 exactement -> ni <30 ni >50, donc Modéré
    });
 
    test('classe au dessus de 50 comme "Bruyant"', () => {
        expect(classifyNoise(55)).toBe('Bruyant');
    });
})