# promise-cache-decorator

Caches promises or memoizes functions (with persistance and defferent cache invalidation strategies)

## Example

```js
const {cache} = require('promise-cache-decorator');
const axios = require('axios');

const p = axios.get('http://api.openweathermap.org/data/2.5/find?q=Moscow');

const cached_forever = cache(p);

const cached_by_5_mins = cache({type:"time", ms:5*60*1000}, p)

const cached_showing_loader_on_slow_requests = cache(
  {type:"time", ms:5*60*1000}, 
  {tardy : show_loader}
  p
)

//will request the weather from openweathermap (with loader if needed) for the first time,
//but will get data from cache for the second time (nevertheless after 5 mins will send request to update data)

cached_showing_loader_on_slow_requests
.then(res => {
  show_the_weather(res);
})
.catch(err => {
  show_the_error(err);
})
```

## Persistance

Implemented onle React-Native AsyncStorage this time.

```js
const {cache, init, set_save, set_load_all} = require('promise-cache-decorator');
const {save, load_all} = require('promise-cache-decorator/AsyncStorage');

set_save(save);
set_load_all(load_all);

init().then(()=>{
  //1. will load all data from AsyncStorage to cache
  //2. you can do all things from previous example
  //3. call save() every time promise resolves
})
```
