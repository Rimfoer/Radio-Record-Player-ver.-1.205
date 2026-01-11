const animParamsVolume = {fps:60,animations:{0:[0],1:[0,1],r1:[1,0],2:[0,1,2],r2:[2,1,0],3:[0,1,2,3],r3:[3,2,1,0],4:[0,1,2,3,4],r4:[4,3,2,1,0],5:[0,1,2,3,4,5],r5:[5,4,3,2,1,0],6:[0,1,2,3,4,5,6],r6:[6,5,4,3,2,1,0],7:[0,1,2,3,4,5,6,7],r7:[7,6,5,4,3,2,1,0],8:[0,1,2,3,4,5,6,7,8],r8:[8,7,6,5,4,3,2,1,0],9:[0,1,2,3,4,5,6,7,8,9],r9:[9,8,7,6,5,4,3,2,1,0],10:[0,1,2,3,4,5,6,7,8,9,10],r10:[10,9,8,7,6,5,4,3,2,1,0]},loop: false,autoPlay: false};
const animParamsBitrate = {fps:60,animations:{animate:[0,1,2,3,4],remove:[4,3,2,1,0]},loop: false,autoPlay: false};
const textColor = {artist:{off:"rgb(255,255,255,0)",on:"rgb(255,255,255,.7)"},title:{off:"rgb(163,163,163,0)",on:"rgb(163,163,163,.8)"}};
const parser = ['record','ps','tm','teo','gop','dc'];
const stationId = ['rr','ps','tm','teo','gop','dc'];
const streamNames = ['rr_main','teo','ps','gop','tm','dc'];
const streamSpeed = ['32.aacp','96.aacp'];
const StreamDomain = 'http://radiorecord.hostingradio.ru/';
const showArtists = ['Gvozd', 'Record Megamix', 'Selection'];
const showTitles = ['Record Club', 'Record News', 'Record Superchart', 'Record Club Chart', 'Record Dance Radio', 'by DJ Peretse', 'Вейкаперы', 'Кремов и Хрусталёв'];
const specialChars = /[@#$%^*_\=\{};:"\\|<>\/]/;

function currPlayerStatus(stat) {
	let cur = $('.station.active').find('.play-button');
	switch(stat !== undefined ? stat : playStatus) {
		case 'waiting':
		case 'stalled':
		case 'loading':
		case 'connecting': {
			if(!cur.hasClass('connecting')) {
				cur.addClass('connecting');
			} else if(cur.hasClass('stopped')) {
				cur.removeClass('stopped').addClass('connecting');
			}
			break;
		}
		case 'playing': {
			if(cur.hasClass('connecting')) {
				cur.removeClass('connecting').addClass('playing');
			} else if(!cur.hasClass('playing')) {
				cur.addClass('playing');
			}
			break;
		}
		default: {
			cur.removeClass(['connecting','playing']);
		}
	}
}

function showMessage(txt, val) {
	let msg;
	if(txt !== undefined && val === undefined) {
		switch(txt) {
			case 'closeTab': msg = 'Теперь вкладку можно закрыть.'; break;
			case 'copy': msg = 'Текст скопирован в буфер обмена'; break;
			case 'copytext': msg = 'Нажми два раза, чтобы скопировать в буфер обмена'; break;
			case 'mute': msg = 'Звук приглушен'; break;
			case 'nocopy': msg = 'Текст не был скопирован'; break;
			case 'noselect': msg = 'Станция не выбрана'; break;
			case 'noconnect': msg = 'Ошибка подключения к аудиопотоку. Проверьте состояние интернет-соединения или попробуйте подключиться позже.'; break;
			case 'notloaded': msg = 'Ошибка загрузки данных о текущем треке'; break;
			case 'notplaying': msg = 'В данный момент ничего не играет.';
			case 'nowplaying': msg = 'Воспроизведение остановлено'; break;
			case 'restart': msg = 'Воспроизведение перезапущено'; break;
			case 'unmute': msg = 'Звук возобновлен'; break;
			case 'volume': msg = `Громкость ${volume}%`; break;
			default: msg = 'Не понимаю, что ты от меня хочешь';
		}
		$('.tooltip').html(msg).addClass('active');
		setTimeout(() => $('.tooltip').removeClass('active'), 5000+String(msg).length*50);
	} else if(txt !== undefined && val !== undefined) {
		switch(txt) {
			case 'volume': msg = `Громкость ${val}%`; break;
		}
		$('.tooltip').hasClass('active') ? $('.tooltip').html(msg) : $('.tooltip').html(msg).addClass('active');
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
				<span style="color: rgb(255,255,255,.7); margin-left: -4px">:${seconds}</span>
				<span style="color: rgb(87,87,87,.5)">&nbsp${milliseconds}</span>
			`);
			break;
		}
		default: {
			$('.watch').children('.playing-time').html(`
				<span style="color: #666666">${hours}</span>
				<span style="color: #A6A6A6; margin-left: -4px">:${minutes}</span>
				<span style="color: rgb(255,255,255,1); margin-left: -4px">:${seconds}</span>
			`);
		}
	}
}

function setPlayURL(curSt) {
	if(curSt === 'rr') {
		url = StreamDomain + streamNames[currStation] + streamSpeed[currSpeed];
	} else {
		$('.station').find('#l32, #l128').removeClass('active');
		bitrate = 'l128',
		currSp = 1,
		url = StreamDomain + streamNames[currStation] + streamSpeed[1];
		removeBitrateSelected(bitrate);
		$('.bitrate').children(`#${mmBitrate}`).animateSprite('play', 'remove').removeClass('active');
		$('.bitrate').children(`#${bitrate}`).addClass('active').animateSprite('play', 'animate');
		localStorage.currBitrate = bitrate;
	}
}

function parseTitle(Titler, txt1, txt2, dop) {
	$.each(Titler, function(key, val) {
		switch(key) {
			case 'artist': {
				if(val !== txt1.attr('title')) {
					txt1.animate({color: textColor.artist.off}, 400, function() {
						$(this).html(val.setArtistName(Titler.trackname));
						$(this).attr('title', val);
						txt1.animate({color: textColor.artist.on}, 400);
					});
				}
				break;
			}
			case 'trackname': {
				if(val !== txt2.attr('title')) {
					txt2.animate({color: textColor.title.off}, 400, function() {
						$(this).html(val.setSongName(Titler.artist));
						$(this).attr('title', val);
						txt2.animate({color: textColor.title.on}, 400);	
					});
				}
				break;
			}
		}
	});
	if(dop) {
		parseCount(OtherParser);
	} else {
		$('.station.active').find('.pie-spinner').addClass('running');
		mInterval = setInterval(() => update_title_Main(), 5000);
	}
}

function update_title_Main(startWith) {
	if(mInterval !== undefined) clearInterval(mInterval);
	if(startWith>=0) currParser = startWith;
	$('.station').find('.pie-spinner').removeClass('running');
	$.getJSON(`https://tags.radiorecord.fm/now.php?chan=${parser[currParser]}`).done(function(data) {
		parseTitle(
			data,
			$(`#${stationId[currParser]}`).find('.station-track-artist'),
			$(`#${stationId[currParser]}`).find('.station-track-title'),
			false
		);
	}).fail(function() {
		$('.station').find('.pie-spinner').removeClass('running');
		showMessage('notloaded');
		mInterval = setInterval(() => {
			$('.station.active').find('.pie-spinner').addClass('running');
			update_title_Main();
		}, 5000);
	});
	return false;
}

function update_title_Adv() {
	if(aInterval !== undefined) clearInterval(aInterval);
	int_phs = 0;
	advInterval = setInterval(() => update_title_Adv_shot(), 500);
}

function update_title_Adv_shot(startWith) {
	if(startWith>=0) OtherParser = startWith;
	if(int_phs <= startCount) {
		$.getJSON(`https://tags.radiorecord.fm/now.php?chan=${parser[OtherParser]}`).done(function(data) {
			parseTitle(
				data,
				$(`#${stationId[OtherParser]}`).find('.station-track-artist'),
				$(`#${stationId[OtherParser]}`).find('.station-track-title'),
				true
			);
		}).fail(function() {
			showMessage('notloaded');
			parseCount(OtherParser);
			if(int_phs >= startCount) {
				clearInterval(advInterval);
				aInterval = setInterval(() => update_title_Adv(), 30000);
			}
		});
		int_phs++;
	} else {
		clearInterval(advInterval);
		aInterval = setInterval(() => update_title_Adv(), 30000);
	}
}

Number.prototype.limiter = function(num) {
	return (Number(this) > 100 ? 100 : Number(this) < 0 ? 0 : Number(this));
}

function parseCount(num) {
	if(currParser !== undefined) {
		if(num >= 5) {
			if(currParser <= 0) {
				OtherParser = 1;
			} else if(currParser > 0 && currParser < 5 || currParser === 5) {
				OtherParser = 0;
			}
		} else {
			if(num === currParser - 1) {
				OtherParser = currParser >= 5 ? 0 : num + 2;
			} else {
				OtherParser = num + 1;
			}
		}
	} else {
		OtherParser = num >= 5 ? 0 : num + 1;
	}
}

Number.prototype.curStation = function(num) {
	switch(Number(this)) {
		case 1: return 3; break; // teo
		case 2: return 1; break; // ps
		case 3: return 4; break; // gop
		case 4: return 2; break; // tm
		default: return Number(this); // rr или dc
	}
}

Number.prototype.fastPlay = function(num) {
	switch(Number(this)) {
		case 49: case 97: return '#rr'; break;
		case 50: case 98: return '#ps'; break;
		case 51: case 99: return '#tm'; break;
		case 52: case 100: return '#teo'; break;
		case 53: case 101: return '#gop'; break;
		case 54: case 102: return '#dc'; break;
	}
}

String.prototype.setArtistName = function(s_name) {
	let artist = String(this);
	if(['Record','Radio Record',''].includes(artist) && checkShowIncludes(s_name)) {
		return `В эфире: ${s_name}`;
	} else if(showArtists.includes(artist) && !s_name) {
		return `В эфире: ${artist}`;
	} else if(['Record','Radio Record',''].includes(artist) && !s_name) {
		return 'В эфире:';
	} else {
		return artist.stripWhitespace();
	}
};

String.prototype.setSongName = function(a_name) {
	let title = String(this);
	if(title === "" || showTitles.includes(title) && !a_name) {
		return '—';
	} else if(showTitles.includes(title) && a_name !== "") {
		return title;
	} else if(specialChars.test(title)) {
		return title.stripWhitespace();
	} else {
		return '— ' + title.stripWhitespace();
	}
};

let checkShowIncludes = function(val) {
	if(showTitles.includes(val) || val.length > 0) {
		return true;
	} else if(val === "" || val.length === 0) {
		return false;
	}
}

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

function checkLSItems() {
	const obj = ['copyTextTip', 'currBitrate', 'currVolume'];
	for(cls = 0; cls < obj.length; cls++) {
		if(!localStorage[obj[cls]]) setLSItem(obj[cls]);
	}
}

function setLSItem(id) {
	switch(id) {
		case 'copyTextTip': localStorage[id] = false; break;
		case 'currBitrate': localStorage[id] = 'l128'; break;
		case 'currVolume': localStorage[id] = '75'; break;
	}
}

function openURL(windowName, url) {
	if(!window.popups) window.popups = [];
	let wnd = window.popups[windowName];
	let resolution = url !== window.location.href ? 'width=422,height=554' : 'width=844,height=422';
	if(wnd && !wnd.closed) wnd.focus();
	wnd = window.open(url, windowName, `top=100,left=200,${resolution},location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no`);
	wnd.focus();
	window.popups[windowName] = wnd;
}

function removeBitrateSelected(str) {
	switch(str) {
		case 'l32': mmBitrate = 'l128'; break;
		case 'l128': mmBitrate = 'l32'; break;
	}
}

(function($) {
	$.fn.extend({
		play: function() {
			$(this).find('.play-button').trigger('click');
		},
		restart: function() {
			soundManager.destroySound('record');
			playStatus = 'connecting';
			currPlayerStatus('connecting');
			setTimeout($(`#${radio}`).startPlay(url), 1500);
			showMessage('restart');
		},
		startPlay: function(link) {
			if(soundManager.soundIDs.length>0) $(`#${radio}`).stop();
			soundObject = soundManager.createSound({
				autoLoad: false,
				autoPlay: true,
				html5PollingInterval: true,
				id: 'record',
				onfinish: function() {
					$(`#${radio}`).restart();
				},
				stream: true,
				url: link,
				useHtml5Audio: true,
				volume: volume,
				whileplaying: function() {
					if(localStorage.playSource !== 'current') $(`#${radio}`).stop();
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
		stop: function() {
			soundManager.destroySound('record');
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