import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Product from '../src/models/product.js';

describe('API Produit', () => {
  const sampleProduct = {
    name: 'Produit Test',
    price: 99.99,
    description: 'Description Test',
    stock: 10
  };

  describe('POST /api/products', () => {
    it('devrait créer un nouveau produit', async () => {
      const res = await request(app)
        .post('/api/products')
        .send(sampleProduct);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe(sampleProduct.name);
    });
  });

  describe('GET /api/products', () => {
    it('devrait retourner tous les produits', async () => {
      await Product.create(sampleProduct);

      const res = await request(app).get('/api/products');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(1);
    });
  });

  describe('GET /api/products/:id', () => {
    it('devrait retourner un produit par id', async () => {
      const product = await Product.create(sampleProduct);

      const res = await request(app).get(`/api/products/${product._id}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe(sampleProduct.name);
    });
  });
});