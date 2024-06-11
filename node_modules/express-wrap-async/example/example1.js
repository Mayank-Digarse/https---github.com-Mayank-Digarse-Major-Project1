/* eslint import/no-extraneous-dependencies:0, no-unused-vars:0 */

import express from 'express';
import wrapAsync from '../src/wrap';

const app = express();

const router = new express.Router();

// returns a promise
function routePromise(req, res) {
  return new Promise((resolve) => {
    res.send({ ok: true });
    resolve();
  });
}

const fakeWait = () => new Promise((resolve) => setTimeout(resolve, 100));

// babel async function
async function asyncRoute(req, res) {
  await fakeWait();
  res.send({ ok: true });
}

// an array of async middlewares
const middlewares = [
  async(req, res, next) => {
    await fakeWait();
    next();
  },
  (req, res, next) => {
    // non async middleware will also work
    next();
  },
  asyncRoute,
];

// error example
async function errorRoute(req, res) {
  await fakeWait();
  throw new Error('unexpected error');
}

// standard express route
function standardRoute(req, res) {
  res.send({ ok: true });
}

// standard express route
function standardRouteWithError(req, res) {
  throw new Error('unexpected error');
}

router.get('/promise', wrapAsync(routePromise));
router.get('/async', wrapAsync(asyncRoute));
router.get('/middlewares', wrapAsync(middlewares));
router.get('/error', wrapAsync(errorRoute));
router.get('/standard', wrapAsync(standardRoute));
router.get('/standard-error', wrapAsync(standardRouteWithError));


app.use('/', router);


app.use((err, req, res, next) => {
  res.status(500);
  res.json({
    error: err.message,
  });
});

/* istanbul ignore if  */
if (!module.parent) {
  app.listen(3000);
}

export default app;
