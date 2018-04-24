const storage = {
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
        }
}

module.exports = storage;