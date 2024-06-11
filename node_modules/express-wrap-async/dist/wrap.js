'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wrap async function to standard express function
 * @param {Function} fn the async function
 * @returns {Function} the wrapped function
 */
function wrapRoute(fn) {
  if (!_lodash2.default.isFunction(fn)) {
    throw new Error('fn should be a function');
  }
  return function (req, res, next) {
    try {
      var result = fn(req, res, next);
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
  if (_lodash2.default.isArray(obj)) {
    return obj.map(wrap);
  }
  return wrapRoute(obj);
}

exports.default = wrap;