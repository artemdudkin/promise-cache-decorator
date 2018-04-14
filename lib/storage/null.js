const storage = {
    //@returns Promise
    save : (id, value) => {
        return Promise.resolve();
    },

    //@returns Promise
    load : (id) => {
        return Promise.resolve();
    },

    //@returns Promise
    delete : (id) => {
        return Promise.resolve();
    },
}

module.exports = storage;