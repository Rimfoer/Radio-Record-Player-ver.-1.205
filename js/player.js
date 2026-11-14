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
