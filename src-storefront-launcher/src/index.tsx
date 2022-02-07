import * as React from 'react';
import * as ReactDOM from "react-dom";
import { createStore, applyMiddleware, compose } from 'redux';
// @ts-ignore
import { Provider } from 'react-redux';
import ReduxThunk from 'redux-thunk';
import reducers from './reducers';

import App from './App';
import "./styles.scss";

var launcher = document.createElement("div");
launcher.setAttribute('id', 'atlas-launcher');
document.body.appendChild(launcher);



export const store = createStore(reducers, {}, compose(applyMiddleware(ReduxThunk)));


var mountNode = document.getElementById("atlas-launcher");
ReactDOM.render(
    <Provider store={ store }>
        <App />
    </Provider>,
 mountNode);


 // Event bus
 const eventBus = () => {
    var atlasLinks = document.getElementsByClassName('atlas-launcher-trigger');
    for (var i=0; i< atlasLinks.length; i++) {
            console.log(atlasLinks[i]); 
            //@ts-ignore
            atlasLinks[i].onclick = function(event: any) {
            const navType: string = event.target.getAttribute('data-nav-type');
            const navSlug: string = event.target.getAttribute('data-slug');
            // @ts-ignore
            if (typeof window._atlasExternalNavRequest === 'function') {
                // @ts-ignore
                window._atlasExternalNavRequest(navType, navSlug);
            }

            return false;
        }
    }
 }
// <a class="atlas-launcher-trigger" data-nav-type="close" href="#">Close messenger</a> 
// <a class="atlas-launcher-trigger" data-nav-type="home" href="#">Open home</a>
// <a class="atlas-launcher-trigger" data-nav-type="category" data-slug="category-2-demo-1" href="#">Open category</a>
// <a class="atlas-launcher-trigger" data-nav-type="article" data-slug="test-2-demo-1" href="#">Open article</a>
 try {
    eventBus();
 } catch (err) {
     console.log(err);
 }
