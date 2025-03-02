import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/user.js';
import jwt from 'jsonwebtoken';

describe('Endpoints d\'authentification', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(async () => {
    // Nettoyer la base de données avant chaque test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('userId');
      expect(res.body).toHaveProperty('message', 'Utilisateur créé avec succès');

      const user = await User.findOne({ email: testUser.email });
      expect(user).toBeTruthy();
      expect(user.email).toBe(testUser.email);
    });

    it('ne devrait pas créer un utilisateur en double', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Email déjà utilisé');
    });

    it('ne devrait pas créer un utilisateur avec un email invalide', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('devrait se connecter avec des identifiants valides', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send(testUser);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('userId');

      // Vérifier que le token est valide
      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET || 'test_secret');
      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('email', testUser.email);
    });

    it('ne devrait pas se connecter avec un mauvais mot de passe', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Email ou mot de passe incorrect');
    });

    it('ne devrait pas se connecter avec un email inexistant', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Email ou mot de passe incorrect');
    });
  });

  describe('GET /api/auth/profile', () => {
    let token;
    let userId;

    beforeEach(async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      token = registerRes.body.token;
      userId = registerRes.body.userId;
    });

    it('devrait obtenir le profil utilisateur avec un token valide', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('email', testUser.email);
      expect(res.body).not.toHaveProperty('password');
      expect(res.body._id).toBe(userId);
    });

    it('ne devrait pas obtenir le profil sans token', async () => {
      const res = await request(app)
        .get('/api/auth/profile');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Token manquant');
    });

    it('ne devrait pas obtenir le profil avec un token invalide', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Token invalide');
    });

    it('ne devrait pas obtenir le profil avec un token malformé', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'InvalidTokenFormat');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Token malformé');
    });
  });
});