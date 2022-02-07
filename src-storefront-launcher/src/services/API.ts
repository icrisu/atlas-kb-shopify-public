import axios from 'axios';
// @ts-ignore
// import jsonp from 'jsonp';
import { get } from 'lodash';

let instance: API;
const instanceKey: string = '@&^#*(sa';

axios.interceptors.request.use((config) => {
        // @ts-ignore
        config.headers['x-shop-origin'] = get(atlasHlpcInitialSetting, 'shop');
        // @ts-ignore
        config.headers['Content-Type', 'application/json'];
        // @ts-ignore
        config.headers['Accept', 'application/json'];
        return config;
    }, (error) => {
    return Promise.reject(error);
});

class API {

    private _apiRoot: string;
    private _shop: string;
    constructor(key: string) {
        if (key !== instanceKey) {
            throw new Error('Cannot instantiate like this')
        }
        // @ts-ignore
        this._apiRoot = get(atlasHlpcInitialSetting, 'apiRoot');
        // @ts-ignore
        this._shop = get(atlasHlpcInitialSetting, 'shop');
    }

    getAllCategories() {
        return axios.get(`${this._apiRoot}/categories?shop=${this._shop}`);
    }

    getCategory(slug: any) {
        return axios.get(`${this._apiRoot}/categories/${slug}?shop=${this._shop}`);
    }

    getArticle(slug: any) {
        return axios.get(`${this._apiRoot}/articles/${slug}?shop=${this._shop}`);
    }

    static getInstance() {
        if (!instance) {
            instance = new API(instanceKey);
        }
        return instance;
    }
}

export default API;
