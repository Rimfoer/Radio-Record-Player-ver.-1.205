let aInterval, advInterval, cs, ctInterval, currParser, currStation, ncs, radio, url;
let currTime = getCurVolRolPos = intAdv = otherParser = smErrorCounter = 0;
let angle = {degree:0};
let bitrate = localStorage.currBitrate || '128';
let currSpeed = $('#'+bitrate).index();
let playStatus = 'reading';
let rmBitrate = invertBitrateValue(bitrate);
let startCount = 5;
let stationText = [[],[],[],[],[],[]];
let volume = localStorage.currVolume || 75;
let win = window.opener !== null ? true : false;

if(win) showMessage('closeTab');
currColorScheme();
updateTitleAdv();

(function($) {
	soundManager.setup({
		preferFlash: false,
		onready: function() {
			checkLSItems();
			localStorage.playSource = '';
			playStatus = 'stopped';
			$('.station').children('.play').removeClass('disabled');
			initAnimElems();
		},
		useHighPerformance: false
	});

	soundManager.onerror = function() {
		smErrorCounter++;
		if(smErrorCounter < 10) setTimeout(soundManager.reboot(), 3000);
	};

	$(document).on('click', '.play-button', function(e) {
		e.preventDefault();
		if($(this).hasClass('playing') && playStatus === 'playing') {
			$(this).stopPlay();
		} else if($(this).closest('.station').hasClass('active') && playStatus === 'stopped') {
			$(this).startPlay(url);
		} else if($(this).hasClass('playing') && playStatus === 'ended') {
			$(this).restart();
		} else {
			if(soundManager.soundIDs.length > 0) {
				$(this).stopPlay();
				setSpinner(0);
				$('.station').find('.cover').animate({opacity: 0.3}, 300);
				$('.station').children('.volume, .bitrate, .pie-timer').removeClass('active');
				$('.station').removeClass('active');
			}
			/****************************************************************************/
			$(this).closest('.station').addClass('active');
			$('.station.active').find('.cover').animate({opacity: 1}, 300);
			radio = $('.station.active').attr('id'),
			currStation = $('.station.active').index(),
			currParser = currStation.setParser();
			setPlayURL(radio);
			$('.station.active').startPlay(url);
			$('.station.active').children('.pie-timer').addClass('active');
			updateTitleMain(currParser);
			if(startCount === 5) startCount--;
			otherParser.parseCount();
		}				
	});

	$(document).on('mousemove mousedown', '.volume.active', function(e) {
		let xpos = e.offsetX || e.pageX-$(this).offset().left;
		let	VolXMouse = Number(Math.round(xpos/25*10)*10).VolLimiter();
		$(this).children('.volume-rollover').animateSprite(getCurVolRolPos === 0 ? 'play' : 'frame', `${Math.round(VolXMouse/10)}`);
		if(e.buttons === 1) {
			$('.volume-click').animateSprite('frame', `${Math.round(VolXMouse/10)}`);
			volume = VolXMouse;
			soundManager.setVolume(stationNames[currStation], VolXMouse);
			localStorage.currVolume = VolXMouse;
			if(soundManager.muted) soundManager.unmute();
		}
		setTimeout(() => getCurVolRolPos = Math.round(VolXMouse/10), 300);
		showMessage('volume', VolXMouse);
	}).on('mouseleave', '.volume.active', function() {
		$(this).children('.volume-rollover').animateSprite('play', 'r'+getCurVolRolPos);
		setTimeout(() => getCurVolRolPos = 0, 300);
		showMessage();
	});

	$(document).on('click', '.listen-player a', function() {
		if($(this).closest('.station').hasClass('active') && playStatus === 'playing') {
			$('.station.active').stopPlay();
		}
		return this.href;
	});

	$(document).on('click', '.bitrate.active div', function() {
		$('.bitrate').children('#'+bitrate).animateSprite('play', 'remove').removeClass('active');
		if(this.id !== bitrate) {
			bitrate = this.id,
			currSpeed = $('#'+this.id).index();
		} else if(radio !== 'rr' && currSpeed === 0) {
			bitrate = '128',
			currSpeed = 1;
		}
		url = StreamDomain + streamNames[currStation] + streamSpeed[currSpeed];
		rmBitrate = invertBitrateValue(bitrate);
		$('.bitrate').children('#'+rmBitrate).animateSprite('play', 'remove');
		$('.bitrate').children('#'+bitrate).addClass('active').animateSprite('play', 'animate');
		$('.station.active').startPlay(url);
		localStorage.currBitrate = this.id;
	}).on('mouseenter', '.bitrate.active div', function() {
		if(this.id !== bitrate) {
			rmBitrate = this.id;
			$('.bitrate').children('#'+rmBitrate).animateSprite('play', 'animate');
		}
	}).on('mouseleave', '.bitrate.active', function() {
		$('.bitrate').children('#'+rmBitrate).animateSprite('play', 'remove');
	});

	$('.link a').on('click', function(e) {
		e.preventDefault();
		window.open(this.href, '_blank').focus();
	});

	$(document).on('dblclick', '.station-text', function() {
		cs = $(this).closest('.station').index(),
		ncs = cs.setParser();
		if(arrRadioShows.includes(stationText[ncs][1]) || arrTitles.includes(stationText[ncs][1])) {
			showMessage('nocopy');
		} else if(stationText[ncs][0] === '' || arrArtists.includes(stationText[ncs][0])) {
			showMessage('nocopy');
		} else {
			navigator.clipboard.writeText(stationText[ncs][0] + ' - ' + stationText[ncs][1].replace(' (Record Mix)', ''));
			showMessage('copy');
		}
	}).on('mousedown', '.station-text', function(e) {
		e.preventDefault();
		if(e.buttons === 2) {
			cs = $(this).closest('.station').index(),
			ncs = cs.setParser();
			$('.context-menu').removeClass('active');
		}
	}).on('mouseenter', '.station-text span', function() {
		if(localStorage.copyTextTip === 'false') {
			$(this).css('pointer-events', 'none');
			showMessage('copytext');
			setTimeout(() => $(this).css('pointer-events', ''), 6000);
			localStorage.copyTextTip = 'true';
		}
	});

	$(document).on('click', function() {
		$('.context-menu').removeClass('active');
	}).on('oncontextmenu', function() {
		return false;
	}).on('contextmenu', function(e) {
		e.preventDefault();
		$('.context-menu').removeClass('active');
		let currMenu = $(e.target).is('span') ? 1 : 0,
			h = parseInt($(`.context-menu:eq(${currMenu})`).css('height')),
			w = parseInt($(`.context-menu:eq(${currMenu})`).css('width')),
			l = e.pageX+w >= window.innerWidth/100*99 ? e.pageX-(w+15) : e.pageX,
			t = e.pageY+h >= window.innerHeight/100*97 ? e.pageY-(h+15) : e.pageY;
		$(`.context-menu:eq(${currMenu})`).css({left: `${l}px`, top: `${t}px`});
		$(`.context-menu:eq(${currMenu})`).addClass('active');
	}).on('mouseleave', function() {
		$('.context-menu').removeClass('active');
	});

	$('.context-menu:eq(0) ul li a').on('click', function(e) {
		e.preventDefault();
		$('.context-menu').removeClass('active');
		if(!$(this).attr('target')) {
			openURL(this.name, this.href);
		} else {
			window.open(this.href, '_blank').focus();
		}
	});

	$('.context-menu:eq(1) ul li div').on('click', function(e) {
		e.preventDefault();
		$('.context-menu').removeClass('active');
		switch($(this).attr('class')) {
			case 'copytext': {
				if(arrRadioShows.includes(stationText[ncs][1]) || arrTitles.includes(stationText[ncs][1])) {
					showMessage('nocopy');
				} else if(stationText[ncs][0] === '' || arrArtists.includes(stationText[ncs][0])) {
					showMessage('nocopy');
				} else {
					navigator.clipboard.writeText(stationText[ncs][0] + ' - ' + stationText[ncs][1].replace(' (Record Mix)', ''));
					showMessage('copy');
				}
				break;
			}
			default: {
				window.open(String(audioStreamLink($(this).attr('class')) + customEncodeURI(stationText, ncs)), '_blank').focus();
				return false;
			}
		}
	});

	$('body').on('mousemove', function(e) {
		let ht = parseInt($('.tooltip').css('height')),
			wt = parseInt($('.tooltip').css('width')),
			lt = e.pageX+wt >= window.innerWidth/100*99 ? e.pageX-(wt+32) : e.pageX+14,
			tt = e.pageY+ht >= window.innerHeight/100*97 ? e.pageY-(ht+2) : e.pageY-2;
		$('.tooltip').css({left: `${lt}px`, top: `${tt}px`});
	}).on('keydown', function(e) {
		switch(e.which) {
			case 27: { // esc
				$('.context-menu').removeClass('active');
				break;
			}
			case 32: { // пробел
				isUndefined(radio) ? $('.station.active').fastPlay() : showMessage('noselect');
				break;
			}
			case (e.which >= 49 && e.which <= 54 ? e.which : false): { // 1, 2, 3, 4, 5, 6 (не numpad!)
				$(`#${stationId[e.which-49]}`).fastPlay();
				break;
			}
			case (e.which >= 97 && e.which <= 102 ? e.which : false): { // 1, 2, 3, 4, 5, 6 (numpad)
				$(`#${stationId[e.which-97]})`).fastPlay();
				break;
			}
			case 77: { // m
				if(soundManager.muted) {
					soundManager.unmute();
					$('.volume-click').animateSprite('frame', volume/10);
					showMessage('unmute');
				} else {
					soundManager.mute();
					$('.volume-click').animateSprite('frame', 0);
					showMessage('mute');
				}
				break;
			}
			case 82: { // r
				if(['playing','connecting'].includes(playStatus)) {
					$('.station.active').restart();
				} else if(!$('.station').hasClass('active')) {
					showMessage('noselect');
				} else {
					showMessage('notplaying');
				}
				break;
			}
		}
	});
})(jQuery);
