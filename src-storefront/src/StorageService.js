var STORAGE_KEY_RATING = 'c%@12a342uyewr@ad';
var STORAGE_KEY_VIEWED = 'c%@1saddsad2a3__sadasd2uyewr@ad';

	function isStorageSupported() {
		return typeof(Storage) !== 'undefined';
	}

	function setRating(rating) {
		if (!isStorageSupported()) {
			return;
		}
		localStorage.setItem(window.knbArticle, rating);
	}

	function getRating(key) {
		if (!isStorageSupported()) {
			return null;
		}
		return localStorage.getItem(window.knbArticle);
	}

	function setViewed(articleId) {
		if (!articleId) {
			return;
		}
		if (!isStorageSupported()) {
			return;
		}
		let viewedItems = getViewed();
		if (viewedItems.indexOf(articleId) === -1) {
			viewedItems.push(articleId);
			if (viewedItems.length > 4) {
				viewedItems.splice(0, 1);
			}
			localStorage.setItem(STORAGE_KEY_VIEWED, JSON.stringify(viewedItems));
			console.log(localStorage.getItem(STORAGE_KEY_VIEWED));
		}
	}

	function getViewed() {
		if (!isStorageSupported()) {
			return null;
		}
		let viewedItems = localStorage.getItem(STORAGE_KEY_VIEWED);
		try {
			viewedItems = JSON.parse(viewedItems);
		} catch (er) {

		}
		if (!Array.isArray(viewedItems)) {
			viewedItems = [];
		}
		return viewedItems;
	}

export default {
	setRating: setRating, getRating: getRating, setViewed: setViewed, getViewed: getViewed
}