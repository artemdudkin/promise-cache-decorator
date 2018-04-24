# React app (example for promise-cache-decorator)


## Install and compile
```bash
npm i
npm i http-server -g
npm run prod
http-server
```
Then look at http://localhost:8080

## How to test cache
First time you will not see  table of weather forecast, but ajax-loader (for 5 seconds aprox.); but if you press "Reload" you will see table immediatly (data is cached and there is no request to yahoopi.com). After 20 seconds ajax-loader will appears again on reload.

Also you can see item with key "cache-weather:[]" at localStorage.

## Debug
If you want to see all internals then compile at dev mode
```bash
npm run dev
```