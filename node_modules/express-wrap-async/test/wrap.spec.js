import request from 'supertest-as-promised';
import app from '../example/example1';
import wrap from '../src/wrap';

describe('wrap', () => {
  it('should work for a promise route', async() => {
    await request(app)
      .get('/promise')
      .expect(200, { ok: true });
  });

  it('should work for an async route', async() => {
    await request(app)
      .get('/async')
      .expect(200, { ok: true });
  });

  it('should work for middlewares', async() => {
    await request(app)
      .get('/middlewares')
      .expect(200, { ok: true });
  });

  it('should work for a standard express route', async() => {
    await request(app)
      .get('/standard')
      .expect(200, { ok: true });
  });

  it('should return an error (async route)', async() => {
    await request(app)
      .get('/error')
      .expect(500, { error: 'unexpected error' });
  });

  it('should return an error (standard route)', async() => {
    await request(app)
      .get('/standard-error')
      .expect(500, { error: 'unexpected error' });
  });

  it('should throw an error if object is not a function', async() => {
    expect(() => wrap({ foo: 'bar' })).to.throw('fn should be a function');
  });
});
