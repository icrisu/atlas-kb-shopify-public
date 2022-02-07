import API from '../services/API';
import { get, isArray, isNil, isEmpty, pick } from 'lodash';
import { AVAILABLE_SCREENS } from '../constants';

import { SHOP_DATA, CATEGORIES, CATEGORY, NAV_EVENTS, 
    ARTICLE, BREADCRUMB_NAV } from './types';

// retrive categories
export const getCategories = () => {
	return async (dispatch: any, getState: any) => {
        let { categories, shop } = getState();
        if (!isArray(categories) && (isNil(shop) || isEmpty(shop))) {
            const rawData: any = await API.getInstance().getAllCategories();
            shop = get(rawData, 'data.data.shop', {});
            categories = get(rawData, 'data.data.categories');
        }
        dispatch({
            type: SHOP_DATA,
            payload: shop,
        })
        dispatch({
            type: CATEGORIES,
            payload: categories,
        })
        dispatch({
            type: BREADCRUMB_NAV,
            payload: {
                screen: AVAILABLE_SCREENS.home
            }
        })
    }
}
// retrive category
export const getCategory = (slug: any) => {
	return async (dispatch: any, getState: any) => {
        const rawData: any = await API.getInstance().getCategory(slug);
        const category: any = get(rawData, 'data.data.category[0]', {});
        dispatch({
            type: CATEGORY,
            payload: category
        })
        dispatch({
            type: BREADCRUMB_NAV,
            payload: {
                screen: AVAILABLE_SCREENS.category,
                data: {
                    category: pick(category, ['slug', 'title'])
                }
            }
        })
        let { shop } = getState();
        if (isEmpty(shop) || isNil(shop)) {
            shop = get(rawData, 'data.data.shop', {});
            dispatch({
                type: SHOP_DATA,
                payload: shop,
            })
        }
    }
}

// retrive article
export const getArticle = (slug: any) => {
	return async (dispatch: any, getState: any) => {
        const rawData: any = await API.getInstance().getArticle(slug);
        const article: any = get(rawData, 'data.data.article', {});

        dispatch({
            type: ARTICLE,
            payload: article
        })
        dispatch({
            type: BREADCRUMB_NAV,
            payload: {
                screen: AVAILABLE_SCREENS.article,
                data: {
                    category: get(article, 'category', {}),
                    article: pick(article, ['slug', 'title'])
                }
            }
        })
        let { shop } = getState();
        if (isEmpty(shop) || isNil(shop)) {
            shop = get(rawData, 'data.data.shop', {});
            dispatch({
                type: SHOP_DATA,
                payload: shop,
            })
        }
    }
}

export const navRequest = (payload: any) => {
	return async (dispatch: any) => {
        dispatch({
            type: NAV_EVENTS,
            payload
        })
    }
}

export const breadcrumbNavRequest = (payload: any) => {
	return async (dispatch: any) => {
        dispatch({
            type: BREADCRUMB_NAV,
            payload
        })
    }
}
