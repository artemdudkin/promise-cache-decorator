import axios from 'axios';

//wait "delay" milliseconds and then call "func" function (ok with async functions)
const deferred = (func, delay) => {
    return (...rest) => {
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                const res = func.apply(this, rest);
                if (typeof res.then != 'function') {
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

const getWeather = (town, country) => {
         return axios({
            url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22"+town+"%2C%20"+country+"%22)&format=json",
            method:'get',
            responseType: 'json',
        })
}

export default {
    getWeather : deferred(getWeather, 3000)
}
