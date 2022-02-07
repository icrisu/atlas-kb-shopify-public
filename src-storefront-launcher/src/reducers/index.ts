import { combineReducers } from 'redux';
import { shop } from './shop';
import { categories } from './categories';
import { category } from './category';
import { navEvents } from './navEvents';
import { article } from './article';
import { breadCrumbNav } from './breadCrumbNav';

export default combineReducers({
    shop, 
    categories,
    navEvents,
    category,
    article,
    breadCrumbNav
});
