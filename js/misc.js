function showMessage(txt, val) {
	if(isUndefined(txt) && !isUndefined(val)) {
		$('.tooltip').html(arrMessages[txt]).addClass('active');
		setTimeout(() => $('.tooltip').removeClass('active'), 5000 + String(arrMessages[txt]).length * 50);
	} else if(isUndefined(txt) && isUndefined(val)) {
		$('.tooltip').html(arrMessages[txt] + val + (txt === 'volume' ? '%' : '')).addClass('active');
	} else {
		$('.tooltip').removeClass('active');
	}
}

function audioStreamLink(type) {
	switch(type) {
		case 'applemusic': return 'https://music.apple.com/us/search?term='; break;
		case 'deezer': return 'https://www.deezer.com/search/'; break;
		case 'spotify': return 'https://open.spotify.com/search/'; break;
		case 'vk': return 'https://vk.com/audios0?q='; break;
		case 'yandexmusic': return 'https://music.yandex.ru/search?text='; break;
		case 'youtubemusic': return 'https://music.youtube.com/search?q='; break;
	}
}

function customEncodeURI(obj, pos) {
	return encodeURI(`${String(obj[pos][0])} - ${String(obj[pos][1]).replace(' (Record Mix)', '')}`);
}

function checkLSItems() {
	const obj = ['copyTextTip', 'currBitrate', 'currVolume'];
	for(cls = 0; cls < obj.length; cls++) {
		if(!localStorage[obj[cls]]) setLSItem(obj[cls]);
	}
}

function setLSItem(id) {
	switch(id) {
		case 'copyTextTip': localStorage[id] = 'false'; break;
		case 'currBitrate': localStorage[id] = '128'; break;
		case 'currVolume': localStorage[id] = '75'; break;
	}
}

function openURL(windowName, link) {
	let params = calcRes(link !== window.location.href ? 'other' : 'that');
	window.open(link, windowName, `top=100,left=200,${params},location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no`).focus();
}

function calcRes(req) {
	let res = {"that": {"height": "428", "width": "844"}, "other": {"height": "554", "width": "422"}};
	let scale = Math.ceil((window.outerWidth - 10) / window.innerWidth * 100);
	let height = Math.round(res[req].height*scale/100);
	let width = Math.round(res[req].width*scale/100);
	console.log(width + 'x' + height + 'px ' + scale + '%');
	return `width=${width},height=${height}`;
}

function currColorScheme() {
	if(window.matchMedia('(prefers-color-scheme: dark)').matches) {
		$('.context-menu').addClass('dark-mode');
	}
}

function isUndefined(a) {
	return (a !== undefined ? true : false);
}

function isEmpty(a) {
	return (a !== "" ? true : false);
}
