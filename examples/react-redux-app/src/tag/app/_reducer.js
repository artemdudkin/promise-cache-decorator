import get from 'lodash.get';
import {
  FORECAST_LOCK,
  FORECAST_OK,
  FORECAST_FAIL
} from './_actions';

const initialState = {
  locked: false,
  data  : [],
};

export default (state = initialState, action) => {
  switch (action.type) {

  case FORECAST_LOCK:  
    return {
      ...state,
      error      : false,
      locked     : true
    };
  
  case FORECAST_OK:
    const forecast = get(action.data, "query.results.channel.item.forecast", []);
    
    return {
      ...state,
      error      : false,
      locked     : false,
      data       : forecast,
    };
    
  case FORECAST_FAIL:
    return {
      ...state,
      error      : action.error,
      locked     : false
    };

  default:
    return state;
  }
}