const animParamsVolume = {fps:60,animations:{0:[0],1:[0,1],r1:[1,0],2:[0,1,2],r2:[2,1,0],3:[0,1,2,3],r3:[3,2,1,0],4:[0,1,2,3,4],r4:[4,3,2,1,0],5:[0,1,2,3,4,5],r5:[5,4,3,2,1,0],6:[0,1,2,3,4,5,6],r6:[6,5,4,3,2,1,0],7:[0,1,2,3,4,5,6,7],r7:[7,6,5,4,3,2,1,0],8:[0,1,2,3,4,5,6,7,8],r8:[8,7,6,5,4,3,2,1,0],9:[0,1,2,3,4,5,6,7,8,9],r9:[9,8,7,6,5,4,3,2,1,0],10:[0,1,2,3,4,5,6,7,8,9,10],r10:[10,9,8,7,6,5,4,3,2,1,0]},loop: false,autoPlay: false};
const animParamsBitrate = {fps:60,animations:{animate:[0,1,2,3,4],remove:[4,3,2,1,0]},loop: false,autoPlay: false};
const textColor = {artist:{off:"rgb(255,255,255,0)",on:"rgb(255,255,255,.7)"},title:{off:"rgb(163,163,163,0)",on:"rgb(163,163,163,.8)"}};
const parser = [71,43,40,57,63,53];
const stationId = ['rr','ps','tm','teo','gop','dc'];
const streamNames = ['rr_main','teo','ps','gop','tm','dc'];
const streamSpeed = ['32.aacp','96.aacp'];
const StreamDomain = 'https://radiorecord.hostingradio.ru/';
const arrArtists = ['Record', 'Radio Record', 'Record Club', 'Record Deep', 'Record Megamix', 'Радио Рекорд', 'Рекорд'];
const arrTitles = ['Armin Van Buuren', 'Feel', 'Gvozd', 'Guest Mix CYRIL', 'Kefir', 'Lady Waks', 'Lena Popova', 'Martin Garrix', 'Nejtrino & Baur', 'Oliver Heldens', 'Record Classix', 'Record Party', 'Record Superchart', 'Record Club Chart', 'Selection', 'The Voice Of My Soul', 'Trance Music Club', 'Zeskullz', 'by DJ Peretse', 'Цветкоff'];
const arrRadioShows = ['InvestFuture', 'Record Dance Radio', 'Record News', 'Вейкаперы', 'Кремов и Хрусталёв', 'Русский Час'];
const specialChars = /[#$%^*\=\{};:"\\|<>]/;
const arrMessages = {'closeTab': 'Теперь вкладку можно закрыть.', 'copy': 'Текст скопирован в буфер обмена', 'copytext': 'Нажми два раза, чтобы скопировать в буфер обмена', 'mute': 'Звук приглушен', 'nocopy': 'Текст не был скопирован', 'noselect': 'Станция не выбрана', 'noconnect': 'Ошибка подключения к аудиопотоку.', 'notloaded': 'Ошибка загрузки данных о текущем треке', 'notplaying': 'В данный момент ничего не играет.', 'played': 'Воспроизведение остановлено', 'restart': 'Воспроизведение перезапущено', 'unmute': 'Звук возобновлен', 'volume': 'Громкость: '};
const stationNames = ['Radio Record',  'Teodor', 'Pirate Station', 'Гоп FM', 'Trancemission', 'Record Dancecore'];

function initAnimElems() {
	$('.volume-click, .volume-rollover').animateSprite(animParamsVolume);
	$('.volume-click').animateSprite('play', `${Math.round(volume/10)}`);
	$('.bitrate').children('div').animateSprite(animParamsBitrate);
	$('.bitrate').children('#'+bitrate).animateSprite('play', 'animate').addClass('active');
	$('.bitrate').children('#'+rmBitrate).animateSprite('play', 'remove');
}

function currPlayerStatus(stat) {
	let playButton = $('.station.active').find('.play-button');
	let playButtonBg = $('.station.active').find('.play-button-bg');
	switch(stat !== undefined ? stat : playStatus) {
		case 'waiting':
		case 'stalled':
		case 'loading':
		case 'connecting': {
			playButton.removeClass('playing').addClass('connecting');
			playButtonBg.animate({opacity: 0.7}, 300);
			break;
		}
		case 'playing': {
			playButton.removeClass('connecting').addClass('playing');
			playButtonBg.animate({opacity: 0.7}, 300);
			break;
		}
		default: {
			playButton.removeClass(['connecting','playing']);
			playButtonBg.animate({opacity: 0}, 300);
		}
	}
}

function showMessage(txt, val) {
	if(txt !== undefined && val === undefined) {
		$('.tooltip').html(arrMessages[txt]).addClass('active');
		setTimeout(() => $('.tooltip').removeClass('active'), 5000 + String(arrMessages[txt]).length * 50);
	} else if(txt !== undefined && val !== undefined) {
		$('.tooltip').html(arrMessages[txt] + val + (txt === 'volume' ? '%' : '')).addClass('active');
	} else {
		$('.tooltip').removeClass('active');
	}
}

function setWatch(ts) {
	let time = Math.floor(ts/1000);
	let days = Math.floor(time%86400);
	let hours = String(Math.floor(days/3600)).padStart(2,'0');
	let minutes = String(Math.floor((days-hours*3600)/60)).padStart(2,'0');
	let seconds = String(days-(hours*3600+minutes*60)).padStart(2,'0');
	let milliseconds = String(ts%1000).padStart(3,'0');
	switch(playStatus) {
		case 'playing':
		case 'loading':
		case 'connecting': {
			$('.watch').children('.playing-time').html(`
				<span style="color: #666666">${hours}</span>
				<span style="color: #A6A6A6; margin-left: -4px">:${minutes}</span>
				<span style="color: rgb(255,255,255,.6); margin-left: -4px">:${seconds}</span>
				<span style="color: rgb(87,87,87,.5)">&nbsp${milliseconds}</span>
			`);
			break;
		}
		default: {
			$('.watch').children('.playing-time').html(`
				<span style="color: #666666">${hours}</span>
				<span style="color: #A6A6A6; margin-left: -4px">:${minutes}</span>
				<span style="color: rgb(255,255,255,.6); margin-left: -4px">:${seconds}</span>
			`);
		}
	}
}

function setPlayURL(curSt) {
	if(curSt !== 'rr' && currSpeed === 0) {
		$('.bitrate').children('div').removeClass('active');
		bitrate = '128',
		currSpeed = 1,
		invertBitrateValue(bitrate);
		$('.bitrate').children('#'+rmBitrate).animateSprite('play', 'remove');
		$('.bitrate').children('#'+bitrate).addClass('active').animateSprite('play', 'animate');
		localStorage.currBitrate = bitrate;
	}
	url = StreamDomain + streamNames[currStation] + streamSpeed[currSpeed];
}

function parseTitle(...args) {
	$.each(args[0], function(key, val) {
		switch(key) {
			case 'artist': {
				if(val !== stationText[args[2]][0]) {
					args[1].children('span:eq(0)').animate({color: textColor.artist.off}, 500, function() {
						$(this).html(val.setArtistName(args[0].song));
						$(this).attr('title', val.checkTextLength());
						$(this).animate({color: textColor.artist.on}, 500);
					});
					stationText[args[2]][0] = val;
				}
				break;
			}
			case 'song': {
				if(val !== stationText[args[2]][1]) {
					args[1].children('span:eq(1)').animate({color: textColor.title.off}, 500, function() {
						$(this).html(val.setSongName(args[2]));
						$(this).attr('title', val.checkTextLength());
						$(this).animate({color: textColor.title.on}, 500, function() {
							if(args[3] === false) setSpinner();
						});	
					});
					stationText[args[2]][1] = val;
				} else {
					if(args[3] === false) setSpinner();
				}
				break;
			}
		}
	});
	if(args[3]) otherParser.parseCount();
}

function updateTitleMain(startWith) {
	let el = $(`#${stationId[currParser]}`).children('.station-text');
	$.getJSON('https://vk.radiorecord.ru/api/stations/now/').done(function(data) {
		parseTitle(data.result[parser[!startWith ? currParser : startWith]].track, el, currParser, false);
	}).fail(function() {
		showMessage('notloaded');
		setSpinner();
	});
}

function updateTitleAdv() {
	intAdv = 0;
	advInterval = setInterval(updateTitleAdvShot, 800);
}

function updateTitleAdvShot(startWith) {
	let elm = $(`#${stationId[otherParser]}`).children('.station-text');
	if(intAdv <= startCount) {
		$.getJSON('https://vk.radiorecord.ru/api/stations/now/').done(function(data) {
			parseTitle(data.result[parser[!startWith ? otherParser : startWith]].track, elm, otherParser, true);
		}).fail(function() {
			showMessage('notloaded');
			otherParser.parseCount();
			if(intAdv >= startCount) {
				clearInterval(advInterval);
				aInterval = setTimeout(update_title_Adv, 33333);
			}
		});
		intAdv++;
	} else {
		clearInterval(advInterval);
		aInterval = setTimeout(updateTitleAdv, 33333);
	}
}

function setSpinner(arg) {
	if(arg !== undefined) {
		$(angle).stop();
	} else {
		angle.degree = 0;
		$(angle).animate({degree: 100},{duration: 5000,easing: 'linear',
			step: function(now) {
				$('.station.active').find('.pie-spinner').css('background', `conic-gradient(rgb(169,169,169,.8) ${now}%, transparent 0)`);
			},
			complete: function() {
				updateTitleMain();
			}
		});
	}
}

Number.prototype.VolLimiter = function(num) {
	return (Number(this) > 100 ? 100 : Number(this) < 0 ? 0 : Number(this));
}

Number.prototype.parseCount = function() {
	let num = Number(this)
	if(currParser !== undefined) {
		otherParser = num >= 5 ? (currParser <= 0 ? 1 : 0) : (num === currParser - 1 ? (currParser >= 5 ? 0 : num + 2) : num + 1);
	} else {
		otherParser = num >= 5 ? 0 : num + 1;
	}
}

Number.prototype.setParser = function(num) {
	switch(Number(this)) {
		case 1: return 3; break; // teo
		case 2: return 1; break; // ps
		case 3: return 4; break; // gop
		case 4: return 2; break; // tm
		default: return Number(this); // rr или dc
	}
}

String.prototype.setArtistName = function(songName) {
	let artist = String(this);
	if(artist === "" || arrArtists.includes(artist)) {
		return (arrRadioShows.includes(songName) ? 'В эфире: ' + songName : 'В эфире:');
	} else {
		return artist.stripWhitespace();
	}
};

String.prototype.setSongName = function(numSt) {
	let title = String(this);
	if(title === "" || arrRadioShows.includes(title)) {
		return '';
	} else if(specialChars.test(title)) {
		return ([0,1,2].includes(numSt) ? '' : '— ') + title.stripWhitespace();
	} else {
		return (arrTitles.includes(title) ? '' : '— ') + title.stripWhitespace();
	}
};

String.prototype.stripWhitespace = function() {
	let txt_0 = String(this);
	if(txt_0.toUpperCase() === txt_0) {
		return (txt_0.length > 25 ? `${txt_0.slice(0, 25)} .&nbsp.&nbsp.` : txt_0);
	} else if(txt_0.toLowerCase() === txt_0) {
		return (txt_0.length > 31 ? `${txt_0.slice(0, 31)} .&nbsp.&nbsp.` : txt_0);
	} else {
		return (txt_0.length > 28 ? `${txt_0.slice(0, 28)} .&nbsp.&nbsp.` : txt_0);
	}
}

String.prototype.checkTextLength = function() {
	let txt = String(this);
	if(txt.toUpperCase() === txt) {
		return (txt.length > 25 ? txt : '');
	} else if(txt.toLowerCase() === txt) {
		return (txt.length > 31 ? txt : '');
	} else {
		return (txt.length > 28 ? txt : '');
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
		case 'copyTextTip': localStorage[id] = false; break;
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

function invertBitrateValue(str) {
	switch(str) {
		case '32': return '128'; break;
		case '128': return '32'; break;
	}
}

function currColorScheme() {
	if(window.matchMedia('(prefers-color-scheme: dark)').matches) {
		$('.context-menu').addClass('dark-mode');
	}
}

(function($) {
	$.fn.extend({
		fastPlay: function() {
			$(this).find('.play-button').trigger('click');
		},
		restart: function() {
			soundManager.destroySound(stationNames[currStation]);
			playStatus = 'connecting';
			currPlayerStatus('connecting');
			setTimeout($('.station.active').startPlay(url), 1500);
			showMessage('restart');
		},
		startPlay: function(link) {
			if(soundManager.soundIDs.length > 0) $('.station').stopPlay();
			soundObject = soundManager.createSound({
				autoLoad: false,
				autoPlay: true,
				html5PollingInterval: true,
				id: stationNames[currStation],
				onfinish: function() {
					$('.station.active').restart();
				},
				stream: true,
				url: link || url,
				useHtml5Audio: true,
				volume: volume,
				whileplaying: function() {
					if(localStorage.playSource !== 'current') $('.station.active').stopPlay();
				}
			});
			if(soundManager.muted) {
				soundManager.unmute();
				$('.volume-click').animateSprite('frame', volume/10);
			}
			setWatch(0);
			$('.watch').addClass('active');
			$('.station.active').children('.volume, .bitrate').addClass('active');
			localStorage.playSource = 'current';
		},
		stopPlay: function() {
			soundManager.destroySound(stationNames[currStation]);
			clearInterval(ctInterval);
			$('.watch').removeClass('active');
			$('.station.active').children('.volume, .bitrate').removeClass('active');
			$('.station.active').find('.play-button').removeClass(['connecting','playing']);
			ctInterval = undefined,
			currTime = 0,
			playStatus = 'stopped';
			setWatch(0);
			localStorage.playSource = '';
		}
	});
})(jQuery);
