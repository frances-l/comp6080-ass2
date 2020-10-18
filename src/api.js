/**
 * Make a request to `path` with `options` and parse the response as JSON.
 * @param {*} path The url to make the reques to.
 * @param {*} options Additiona options to pass to fetch.
 */
const getJSON = (path, options) => {
    return new Promise((resolve, reject) => {
        fetch(path, options).then((response) => {
            if (response.status === 200) {
                resolve(response.json());
            } else {
                response
                    .text()
                    .then((decoded) => {
                        reject(decoded);
                    })
                    .catch((err) => console.log("uh oh" + err));
            }
        });
    });
};

/**
 * This is a sample class API which you may base your code on.
 * You may use this as a launch pad but do not have to.
 */
export default class API {
    /** @param {String} url */
    constructor(url) {
        this.url = url;
    }

    /** @param {String} path */
    makeAPIRequest(path, options) {
        return getJSON(`${this.url}/${path}`, options);
    }

    post(path, options) {
        return getJSON(`${this.url}/${path}`, {
            ...options,
            method: "POST",
        });
    }

    put(path, options) {
        return getJSON(`${this.url}/${path}`, {
            ...options,
            method: "PUT",
        });
    }

    get(path, options) {
        return getJSON(`${this.url}/${path}`, {
            ...options,
            method: "GET",
        });
    }

    delete(path, options) {
        return getJSON(`${this.url}/${path}`, {
            ...options,
            method: "DELETE",
        });
    }
}
