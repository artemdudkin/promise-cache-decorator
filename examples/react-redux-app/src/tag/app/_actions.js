import api from '../../api';
import {cache, setStorage} from 'promise-cache-decorator';

export const FORECAST_LOCK          = "FORECAST_LOCK";
export const FORECAST_OK            = "FORECAST_OK";
export const FORECAST_FAIL          = "FORECAST_FAIL";

setStorage({
    //@returns Promise
    save : (id, value) => {
        if (typeof localStorage != 'undefined') {
            try {
                localStorage.setItem("cache-" + id, value);
                return Promise.resolve()
            } catch (err) {
                return Promise.reject(err);
            }
        }
        return Promise.reject("localStorage is not defined")
    },

    //@returns Promise
    load : (id) => {
        if (typeof localStorage != 'undefined') {
            try {
                const value = localStorage.getItem("cache-" + id)
                return Promise.resolve(value==null?undefined:value);
            } catch (err) {
                return Promise.reject(err);
            }
        }
        return Promise.reject("localStorage is not defined")
    },

    //@returns Promise
    remove : (id) => {
        if (typeof localStorage != 'undefined') {
            try {
                localStorage.removeItem("cache-" + id);
                return Promise.resolve()
            } catch (err) {
                return Promise.reject(err);
            }
        }
        return Promise.reject("localStorage is not defined")
    },
});


const _cached_load = (dispatch) => {
	return cache({
		type:"age",
		maxAge:20000,
		id:"weather",
		tardy : () => {dispatch({type:FORECAST_LOCK})},
		tardy_timeout : 200
 	})(api.getWeather.bind(this, dispatch))();
}


export const load = () => (dispatch, getState) => {
	_cached_load(dispatch).then(res => {
		dispatch({type:FORECAST_OK, data:res.data});
	})
  	.catch( err => {
		dispatch({type:FORECAST_FAIL, error:err});
  	});
}

