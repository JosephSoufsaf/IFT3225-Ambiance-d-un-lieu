import { test, describe, expect } from 'vitest';
const { validateRegistration, ownsAccount } = require('../Routes/userRouter');

describe('validateRegistration', () => {
  test('retourne un tableau vide quand tous les champs sont présents', () => {
    expect(validateRegistration('marc', 'marc@example.com', 'motdepasse123')).toEqual([]);
  });
 
  test('signale les champs manquants individuellement', () => {
    expect(validateRegistration(undefined, 'marc@example.com', 'motdepasse123')).toEqual(['username']);
  });
 
  test('signale plusieurs champs manquants à la fois', () => {
    expect(validateRegistration(undefined, undefined, undefined)).toEqual(['username', 'email', 'password']);
  });
});
 
describe('ownsAccount', () => {
  test('retourne true quand les deux id correspondent', () => {
    expect(ownsAccount('abc123', 'abc123')).toBe(true);
  });
 
  test('retourne false quand les id sont différents', () => {
    expect(ownsAccount('abc123', 'xyz789')).toBe(false);
  });
 
  test('retourne true même si les types diffèrent grâce à légalité faible (==)', () => {
    expect(ownsAccount('123', 123)).toBe(true);
  });
});