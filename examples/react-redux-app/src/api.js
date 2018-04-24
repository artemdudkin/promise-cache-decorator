import axios from 'axios';

const ts = Date.now();

var deferred = (func, delay) => {
    return (...rest) => {
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                const res = func.apply(this, rest);
                if (!(res instanceof Promise)) {
                    resolve( res );
                } else {
                    res
                    .then(res=>{
                        resolve(res);
                    })
                    .catch(err=>{
                        reject(err);
                    })
                }
            }, delay);
        })
    }
}

const _getWeather = () => {
         return axios({
            url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22moscow%2C%20ru%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys",
            method:'get',
            responseType: 'json',
        })
        .then(res => {
            res.data.ts = Date.now() - ts;
            return res;
        })
}

export default {
    getWeather : deferred(_getWeather, 3000)
}
