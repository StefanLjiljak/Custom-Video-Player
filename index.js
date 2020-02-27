const pipButton = document.querySelector('#pip-button');
const fullscreenButton = document.querySelector('#fullscreen-button');
const fullscreenIcons = fullscreenButton.querySelectorAll('use');
const videoContainer = document.querySelector('#video-container');
const playbackAnimation = document.querySelector('#playback-animation');
const video = document.getElementById('video')
const videoControls = document.getElementById('video-controls')
const progressBar = document.querySelector('#progress-bar');
const seek = document.querySelector('#seek');
const seekTooltip = document.querySelector('#seek-tooltip');
const volumeButton = document.querySelector('#volume-button');
const volumeIcons = document.querySelectorAll('.volume-button use');
const volumeMute = document.querySelector('use[href="#volume-mute"]');
const volumeLow = document.querySelector('use[href="#volume-low"]');
const volumeHigh = document.querySelector('use[href="#volume-high"]');
const volume = document.querySelector('#volume');

const videoWorks = !!document.createElement('video').canPlayType;
if (videoWorks) {
    video.controls = false;
    videoControls.classList.remove('hidden');
}

const playButton = document.querySelector('#play');

function togglePlay() {
    if (video.paused || video.ended) {
        video.play();
    } else{
        video.pause();
    }
}

playButton.addEventListener('click', togglePlay);

const playbackIcons = document.querySelectorAll('.playback-icons use');

function updatePlayButton() {
    playbackIcons.forEach(icon => icon.classList.toggle('hidden'));

    if (video.paused) {
        playButton.setAttribute('data-title', 'Play (k)')
    } else {
        playButton.setAttribute('data-title', 'Pause (k)')
    }
}

video.onmouseenter = showControls;
video.onmouseleave = hideControls;
videoControls.onmouseenter = showControls;
videoControls.onmouseleave = hideControls;
videoContainer.onfullscreenchange = updateFullscreenButton;
video.onclick = animatePlayback;
video.addEventListener('play', updatePlayButton);
video.addEventListener('pause', updatePlayButton);
video.addEventListener('loadedmetadata', initializeVideo);
video.addEventListener('timeupdate', updateTimeElapsed);
video.addEventListener('timeupdate', updateProgress);
seek.addEventListener('mousemove', updateSeekTooltip);
seek.addEventListener('input', skipAhead);
volume.addEventListener('input', updateVolume);
video.addEventListener('volumechange', updateVolumeIcon);
volumeButton.addEventListener('click', toggleMute);
video.addEventListener('click', togglePlay);
fullscreenButton.addEventListener('click', toggleFullScreen);
document.addEventListener('DOMContentLoaded', () =>{
    if (!('pictureInPictureEnabled' in document)) {
        pipButton.classList.add('hidden');
    }
});
pipButton.onclick = togglePip;
document.onkeyup = keyboardShortcuts;

const timeElapsed = document.querySelector('#time-elapsed');
const duration = document.querySelector('#duration');

function formatTime(timeInSeconds) {
    const result = new Date (timeInSeconds*1000).toISOString().substr(11,8);

    return{
        minutes: result.substr(3,2),
        seconds: result.substr(6,2)
    };
};

function initializeVideo() {
    const videoDuration = Math.round(video.duration);
    seek.setAttribute('max', videoDuration);
    progressBar.setAttribute('max', videoDuration);
    const time = formatTime(videoDuration);
    duration.innerText = `${time.minutes}:${time.seconds}`;
    duration.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`);
}

function updateTimeElapsed(){
    const time = formatTime(Math.round(video.currentTime));
    timeElapsed.innerText = `${time.minutes}:${time.seconds}`;
    timeElapsed.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`);
}

function updateProgress() {
    seek.value = Math.floor(video.currentTime);
    progressBar.value = Math.floor(video.currentTime);
}

function updateSeekTooltip(event) {
    const skipTo = Math.round((event.offsetX / event.target.clientWidth) * parseInt(event.target.getAttribute('max'), 10));
    seek.setAttribute('data-seek', skipTo);
    const t = formatTime(skipTo);
    seekTooltip.textContent = `${t.minutes}:${t.seconds}`;
    const rect = video.getBoundingClientRect();
    seekTooltip.getElementsByClassName.left = `${event.pageX - rect.left}px`;
}

function skipAhead(event) {
    const skipTo = event.target.dataset.seek;
    video.currentTime = skipTo;
    progressBar.value = skipTo;
    seek.value = skipTo;
}

function updateVolume (){
    if (video.muted) {
        video.muted = false;
    }
    video.volume = volume.value;
}

function updateVolumeIcon() {
    volumeIcons.forEach(icon => {
        icon.classList.add('hidden');
    });

    volumeButton.setAttribute('data-title', 'Mute (m)');

    if (video.muted || video.volume ===0) {
        volumeMute.classList.remove('hidden');
        volumeButton.setAttribute('data-title', 'Unmute (m)')
    } else if (video.volume > 0 && video.volume <= 0.5) {
        volumeLow.classList.remove('hidden');
    } else {
        volumeHigh.classList.remove('hidden');
    }
}

function toggleMute() {
    video.muted = !video.muted;
     if (video.muted) {
         volume.setAttribute('data-volume', volume.value);
         volume.value = 0;
     } else {
         volume.value = volume.dataset.volume;
     }
}

function animatePlayback() {
    playbackAnimation.animate([
        {
            opacity: 1,
            transform: "scale(1)"
        },
        {
            opacity: 0,
            transform: "scale(1.3)",
        }
    ],
    {
        duration: 500,
    });
}

function toggleFullScreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        videoContainer.requestFullscreen();
    }
}

function updateFullscreenButton() {
    fullscreenIcons.forEach(icon => icon.classList.toggle('hidden'));

    if (document.fullscreenElement) {
        fullscreenButton.setAttribute('data-title', 'Exit full screen (f)')
    } else {
        fullscreenButton.setAttribute('data-title', 'Full screen (f)')
    }
}

async function togglePip() {
    try {
        if (video !== document.pictureInPictureElement) {
            pipButton.disabled = true;
            await video.requestPictureInPicture();
        } else {
            await document.exitPictureInPicture();
        }
    } catch (error) {
        console.error(error);
        
    } finally {
        pipButton.disabled = false;
    }
}

function hideControls() {
    if (video.paused) {
        return;
    }
    videoControls.classList.add('hidden');
}

function showControls() {
    videoControls.classList.remove('hide');
}

function keyboardShortcuts(event) {
    const { key } = event;
    switch (key) {
        case 'k':
            togglePlay();
            animatePlayback();
            if (video.paused) {
                showControls();
            } else {
                setTimeout(()=> {
                    hideControls();
                }, 2000);
            }
            break;
        case 'm':
            toggleMute();
            break;
        case 'f':
            toggleFullScreen();
            break;
        case 'p':
            togglePip();
            break;
    }
}