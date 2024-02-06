const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime")
 
let volume = 0.5;
video.volume = volume;

const handlePlayClick = (e) => {
    if(video.paused) {
        video.play();
    } else {
        video.pause();
    }

    playBtn.innerText = video.paused ? "Play" : "Pause";
}

const handleMute = (e) => {
    video.muted = video.muted ? false : true;
    muteBtn.innerText = video.muted ? "Unmute" : "Mute";
    volumeRange.value = video.muted ? 0 : volume;
}

const handleVolumeChange = (event) => {
    const {target:{value}} = event;
    if(video.muted){
        video.muted = false;
        muteBtn.innerText = "Mute";   
    }
    volume = value;
    video.volume = value;
}

const handleLoadedmetadata = () => {
    totalTime.innerText = Math.floor(video.duration);
}

const handleTimeUpdate = () => {
    currentTime.innerText = Math.floor(video.currentTime);
};

playBtn.addEventListener('click', handlePlayClick);
muteBtn.addEventListener('click', handleMute);
volumeRange.addEventListener('input', handleVolumeChange);
video.addEventListener('timeupdate', handleTimeUpdate);

video.readyState ? handleLoadedmetadata() : video.addEventListener("loadedmetadata", handleLoadedmetadata);