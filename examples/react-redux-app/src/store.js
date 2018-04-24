import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import api from './api';

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
// Reducers
//---------------------------------

const NullReducer = (state = {}, action) => {
      return state;
}

const createReducer = (asyncReducers) => {
  return combineReducers({
    null : NullReducer,	//we need at least one reducer from the scratch 
                	    //to prevent warning "Store does not have a valid reducer. Make sure the argument passed to combineReducers is an object whose values are reducers."
			                //at the very first call (before any reducer added)
    ...asyncReducers
  });
}

//---------------------------------
// Store
//---------------------------------

const store = createStore(
    createReducer(), 
    {},
    compose(
        applyMiddleware(...middlewares)
    )
);

store.asyncReducers = {};

//look at http://stackoverflow.com/questions/32968016/how-to-dynamically-load-reducers-for-code-splitting-in-a-redux-application
export function injectAsyncReducer(name, asyncReducer) {
  if (!store.asyncReducers[name]) {
    store.asyncReducers[name] = asyncReducer;
    store.replaceReducer(createReducer(store.asyncReducers));
  }
}

export default store;
