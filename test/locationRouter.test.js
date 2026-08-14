// const { test, describe, expect } = require('vitest');
import { test, describe, expect } from 'vitest';
const { findUserLocations, isAlreadySaved, filterOutLocations } = require('../Routes/locationRouter');
const { Location } = require('../models/Location');
const mongoose = require('mongoose');

describe('findUserLocations', () => {

    let id1 = '0123456789abcdef01234567';
    let id2 = '0123456789abcdefabcdef01';
    let id3 = '0123456789abcdef76543210';
    const saved = [
        { location: new mongoose.Types.ObjectId(id1), category: 'favorite' },
        { location: new mongoose.Types.ObjectId(id2), category: 'observed' },
        { location: new mongoose.Types.ObjectId(id3), category: 'observed' },
    ];

    test('retourne tout avec le message par défaut quand aucun filtre nest fourni', () => {
        expect(findUserLocations(undefined, undefined, undefined, saved)).toEqual({
        data: saved,
        message: 'All user locations'
        });
    });

    test('filtre par catégorie seule et retourne le message correspondant', () => {
        expect(findUserLocations(undefined, 'observed', undefined, saved)).toEqual({
        data: [saved[1], saved[2]],
        message: 'All of users saved locations for category : observed'
        });
    });

    test('retourne un tableau vide (et non undefined) quand aucune entrée ne correspond à la catégorie', () => {
        expect(findUserLocations(undefined, 'nonexistent', undefined, saved)).toEqual({
        data: [],
        message: 'All of users saved locations for category : nonexistent'
        });
    });

    test('trouve une entrée précise par nom + catégorie', () => {
        expect(findUserLocations('Parc X', 'favorite', id1, saved)).toEqual({
        data: saved[0],
        message: 'Location is in users saved location'
        });
    });

    test('trouve une entrée par nom seul (peu importe la catégorie)', () => {
        expect(findUserLocations('Parc Z', undefined, id2, saved)).toEqual({
        data: saved[1],
        message: 'Location is in users saved locations'
        });
    });

    test('retourne data undefined et le bon message quand nom + catégorie ne correspondent à rien', () => {
        expect(findUserLocations('Parc X', 'observed', id1, saved)).toEqual({
        data: undefined,
        message: 'Location is not in users saved locations'
        });
    });

    test('fonctionne avec une liste de savedLocations vide', () => {
        expect(findUserLocations(undefined, undefined, undefined, [])).toEqual({
        data: [],
        message: 'All user locations'
        });
    });
});

describe('isAlreadySaved', () => {
  const id1 = new mongoose.Types.ObjectId('0123456789abcdef01234567');
  const id2 = new mongoose.Types.ObjectId('abcdef0123456789abcdef01');
 
  const saved = [
    { location: id1, category: 'favorite' },
    { location: id2, category: 'observed' },
  ];
 
  test('retourne true quand le lieu est déjà enregistré sous la même catégorie', () => {
    expect(isAlreadySaved(saved, id1.toString(), 'favorite')).toBe(true);
  });
 
  test('retourne false quand le lieu est enregistré mais sous une autre catégorie', () => {
    expect(isAlreadySaved(saved, id1.toString(), 'observed')).toBe(false);
  });
 
  test('retourne false quand le lieu n\'est pas du tout enregistré', () => {
    const unknownId = new mongoose.Types.ObjectId('ffffffffffffffffffffffff');
    expect(isAlreadySaved(saved, unknownId.toString(), 'favorite')).toBe(false);
  });
});
 
describe('filterOutLocation', () => {
  const id1 = new mongoose.Types.ObjectId('0123456789abcdef01234567');
  const id2 = new mongoose.Types.ObjectId('abcdef0123456789abcdef01');
 
  const saved = [
    { location: id1, category: 'favorite' },
    { location: id1, category: 'observed' }, // même lieu, autre catégorie
    { location: id2, category: 'observed' },
  ];
 
  test('retire uniquement l\'entrée qui matche id ET catégorie à la fois', () => {
    const result = filterOutLocations(saved, id1.toString(), 'favorite');
    expect(result).toEqual([saved[1], saved[2]]);
  });
 
  test('garde une entrée si le lieu correspond mais la catégorie est différente', () => {
    // id1/observed existe dans saved, donc seule cette entrée devrait être retirée,
    // pas id1/favorite qui a le même lieu mais une catégorie différente
    const result = filterOutLocations(saved, id1.toString(), 'observed');
    expect(result).toEqual([saved[0], saved[2]]);
  });
 
  test('ne retire rien quand aucune entrée ne matche id + catégorie', () => {
    const unknownId = new mongoose.Types.ObjectId('ffffffffffffffffffffffff');
    const result = filterOutLocations(saved, unknownId.toString(), 'favorite');
    expect(result).toEqual(saved);
  });
});
