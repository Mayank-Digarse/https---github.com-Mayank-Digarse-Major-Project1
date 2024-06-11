import _ from 'lodash';

/**
 * Wrap async function to standard express function
 * @param {Function} fn the async function
 * @returns {Function} the wrapped function
 */
function wrapRoute(fn) {
  if (!_.isFunction(fn)) {
    throw new Error('fn should be a function');
  }
  return (req, res, next) => {
    try {
      const result = fn(req, res, next);
      if (result && result.catch) {
        result.catch(next);
      }
    } catch (e) {
      next(e);
    }
  };
}

/**
 * Wrap all middlewares from array
 * @param obj the object (controller exports)
 * @returns {Function|Array} the wrapped object
 */
function wrap(obj) {
  if (_.isArray(obj)) {
    return obj.map(wrap);
  }
  return wrapRoute(obj);
}

export default wrap;
