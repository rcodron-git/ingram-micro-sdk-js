const request = require('supertest');
const app = require('../app'); // Adjust the path as necessary
const { expect } = require('chai');

describe('API Endpoints', () => {
    it('should return a hello world message', (done) => {
        request(app)
            .get('/api/hello') // Adjust the endpoint as necessary
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('message', 'Hello World');
                done();
            });
    });
});