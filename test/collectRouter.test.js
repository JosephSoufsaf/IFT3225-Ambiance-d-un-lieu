// const {test, describe, expect} = require('vitest');
import { test, describe, expect } from 'vitest';
const {shouldAddLocation} = require('../Routes/collectRouter');
const {Location} = require('../models/Location')
const mongoose = require('mongoose');

describe('Ajout conditionnel localisation à lajout dune observation a un user', () => {
    test('Devrait ajouter (vrai) quand utilisateur na aucun lieu denregistré', () => {
        const saved = [];
        expect(shouldAddLocation(saved, 'xyz123')).toBe(true);
    })
    test('Lieu est enregistré mais dans les favoris', () => {
        const id = '0123456789abcdef01234567'; // 24 hexadecimal characters
        const saved = [{location: new mongoose.Types.ObjectId(id), category: 'favorite'}];
        expect(shouldAddLocation(saved, id)).toBe(true);
    })
    test('Lieu est déjà enregistré dans les observés', () => {
        const id = 'abcdef0123456789abcdef01';
        const saved = [{location: new mongoose.Types.ObjectId(id), category:'observed'}];
        expect(shouldAddLocation(saved, id)).toBe(false);
    })
})