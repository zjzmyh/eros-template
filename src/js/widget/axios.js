import _isFunction from 'lodash/isFunction'
const bmAxios = weex.requireModule('bmAxios')
export default class Axios {
    constructor({timeout, apis, baseUrl, requestHandler, responseHandler}) {
        this.apis = apis
        this.timeout = timeout 
        this.baseUrl = baseUrl
        this.requestHandler = requestHandler
        this.responseHandler = responseHandler
        return this
    }
    install(Vue) {
        //extend promise
        Promise.prototype.finally = function (callback) {
            let P = this.constructor;
            return this.then(
                value  => P.resolve(callback()).then(() => value),
                reason => P.resolve(callback()).then(() => { throw reason })
            );
        };
        Promise.prototype.done = function (onFulfilled, onRejected) {
            this.then(onFulfilled, onRejected)
                .catch(function (reason) {
                    // Throw a global error
                    setTimeout(() => { throw reason }, 0);
                });
        };

        let self = this
        Vue.prototype.$fetch = (options) => {
            return new Promise((resolve, reject) => {
                if(_isFunction(self.requestHandler)) {
                    self.requestHandler(options, () => { handleAxios(options, resolve, reject) })
                } else {
                    handleAxios(options, resolve, reject)
                }
            })
        }

        function handleAxios({name, url, data, method, header}, resolve, reject) {
            bmAxios.fetch({
                url: self.baseUrl + self.apis[name] || url,
                data: data || {},
                method: method || 'GET',
                header: header || {},
                timeout: self.timeout || 30000,
            }, (resData) => {
                // 统一的监控
                if(_isFunction(self.responseHandler)) {
                    self.responseHandler({name, url, data, method, header}, resData, resolve, reject)
                }   else {
                    resolve(resData)
                }
            })
        }
    }
}


