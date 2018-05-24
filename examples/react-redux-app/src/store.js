import { combineReducers, createStore, applyMiddleware, compose } from 'redux';

//---------------------------------
// Middlewares
//---------------------------------

import thunk from 'redux-thunk';

const middlewares = [thunk];

if (typeof __DEV__ !== 'undefined' && __DEV__ === true) {
  const createLogger = require('redux-logger').createLogger;
  const logger = createLogger({
    duration: true,
    timestamp: false,
    collapsed: true
  });

  middlewares.push(logger);
}

//---------------------------------
// Store
//---------------------------------

const store = createStore(
  combineReducers({
    app : require('./tag/app/_reducer').default
  }),
  {},
  compose(
    applyMiddleware(...middlewares)
  )
);

export default store;
