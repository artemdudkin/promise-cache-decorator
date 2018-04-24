import api from '../../api';

import {cache, setStorage} from 'promise-cache-decorator';
import storage from 'promise-cache-decorator/lib/storage/localStorage';
setStorage(storage);

export const FORECAST_LOCK          = "FORECAST_LOCK";
export const FORECAST_OK            = "FORECAST_OK";
export const FORECAST_FAIL          = "FORECAST_FAIL";

const _getWeather = (town, country) => {
	const ts = Date.now();
	return api.getWeather(town, country)
			.then(res => {
				res.data.ts = Date.now() - ts;
				return res;
			})	
}

const _load = (dispatch, town, country) => {
	return cache({
		type:"age",
		maxAge:20000,
		id:"weather",
		tardy : () => {dispatch({type:FORECAST_LOCK})},
		tardy_timeout : 200
 	})(_getWeather)(town, country);
}

export const load = (town, country) => (dispatch, getState) => {
	_load(dispatch, town, country).then(res => {
		dispatch({type:FORECAST_OK, data:res.data});
	})
  	.catch( err => {
		dispatch({type:FORECAST_FAIL, error:err});
  	});
}

