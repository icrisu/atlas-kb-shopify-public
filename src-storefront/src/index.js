import StorageService from './StorageService';
var states = ['disappointed', 'neutral', 'happy'];

function addToQuery(uri, key, value) {
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    return uri + separator + key + '=' + value;
}

function jsonp(url, callback) {
    var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = function(data) {
        delete window[callbackName];
        document.body.removeChild(script);
        callback(data);
    };

    var script = document.createElement('script');
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
    document.body.appendChild(script);
}

function setRatingServer(rating, existingRating) {
    let path = addToQuery(window.knbratingPath, 'rating', rating)
    path = addToQuery(path, 'er', existingRating);
    path = addToQuery(path, 'id', window.knbArticle);
    jsonp(path, function(data) {
        // console.log(data);
    });
    // var xmlhttp = new XMLHttpRequest();
    // xmlhttp.onreadystatechange = function() {
    //     if (this.readyState == 4 && this.status == 200) {
    //         // console.log(this.responseText);
    //     }
    // };
    // // knbArticle
    // let path = addToQuery(window.knbratingPath, 'rating', rating)
    // path = addToQuery(path, 'er', existingRating);

    // path = addToQuery(path, 'id', window.knbArticle);
    // xmlhttp.open('GET', path);
    // xmlhttp.send();    
}
function getViewedArticles(ids) {
    let path = addToQuery(window.knbViewedPath, 'ids', JSON.stringify(ids));
    path = addToQuery(path, 'knbMainPath', window.knbMainPath);
    path = addToQuery(path, 'recentlyLabel', window.knbrecentlyLabel);
    path = addToQuery(path, 'knbQuery', window.knbQuery);

    jsonp(path, function(data) {
    });
}

function selectItem(rating) {
    if (rating) {
        for (let i = 0; i < states.length; i++) {
            document.getElementById(states[i] + '-off').style.display = 'block';
            document.getElementById(states[i] + '-on').style.display = 'none';
            if (rating === states[i]) {
                document.getElementById(states[i] + '-off').style.display = 'none';
                document.getElementById(states[i] + '-on').style.display = 'block';
            }
        }
    }
}
try {
    selectItem(StorageService.getRating());
} catch (err) {}

try {
    StorageService.setViewed(window.knbArticle);
    if (Array.isArray(StorageService.getViewed()) && StorageService.getViewed().length > 0) {
        getViewedArticles(StorageService.getViewed());
    }
} catch (err) {}

function setRating(rating) {
    var existingRating = StorageService.getRating();
    if (!existingRating) {
        StorageService.setRating(rating);
        selectItem(rating);
        setRatingServer(rating);
        return;
    }
    if (existingRating && rating !== existingRating) {
        StorageService.setRating(rating);
        selectItem(rating);
        setRatingServer(rating, existingRating);
        return;
    }
}
try {
    var disappointed = document.getElementById('disappointed');
    disappointed.addEventListener("click", function(e) {
        e.preventDefault();
        setRating('disappointed');
    }, false);
    
    var neutral = document.getElementById('neutral');
    neutral.addEventListener("click", function(e) {
        e.preventDefault();
        setRating('neutral');
    }, false);
    
    var happy = document.getElementById('happy');
    happy.addEventListener("click", function(e) {
        e.preventDefault();
        setRating('happy');
    }, false);
} catch (err) {}
