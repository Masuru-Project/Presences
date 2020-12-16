const presence = new Presence({
    clientId: "788064233882910750"
  }),
  strings = presence.getStrings({
    play: "presence.playback.playing",
    pause: "presence.playback.paused"
  });

function getTimestamps(
  videoTime: number,
  videoDuration: number
): Array<number> {
  const startTime = Date.now(),
        endTime = Math.floor(startTime / 1000) - videoTime + videoDuration;
  return [Math.floor(startTime / 1000), endTime];
}

let lastPlaybackState = null,
    playback,
    browsingStamp = Math.floor(Date.now() / 1000);
const urlRegex = /watch\/.*?\/(\d+)\/(\d+)/;

if (lastPlaybackState != playback) {
  lastPlaybackState = playback;
  browsingStamp = Math.floor(Date.now() / 1000);
}

presence.on("UpdateData", async () => {
  playback = document.querySelector("div.plyr__video-wrapper > video") !== null ? true : false;

  const video: HTMLVideoElement = document.querySelector("div.plyr__video-wrapper > video"),
        presenceData: PresenceData = {
    largeImageKey: "logo"
  };

  if (!playback) {
    presenceData.details = "Browsing...";
    presenceData.startTimestamp = browsingStamp;

    delete presenceData.state;
    delete presenceData.smallImageKey;

    presence.setActivity(presenceData, true);
  }

  if (video !== null && !isNaN(video.duration)) {

    const videoTitle = document.querySelector("div#watch-page-main") as HTMLElement,
          matched = location.href.match(urlRegex),
          seasonNumber = matched ? matched[1] : null,
          episodeNumber = matched ? matched[2] : null,
          timestamps = getTimestamps(
            Math.floor(video.currentTime),
            Math.floor(video.duration)
          );

    presenceData.smallImageKey = video.paused ? "pause" : "play";
    presenceData.smallImageText = video.paused
      ? (await strings).pause
      : (await strings).play;
    presenceData.startTimestamp = timestamps[0];
    presenceData.endTimestamp = timestamps[1];

    presence.setTrayTitle(video.paused ? "" : videoTitle.innerText);

    presenceData.details =
      videoTitle !== null ? videoTitle.dataset.fastaniTitle : "Title not found...";
    presenceData.state =
      matched !== null ? `Episode ${episodeNumber} · Season ${seasonNumber}` : "Episode not found...";

    if (video.paused) {
      delete presenceData.startTimestamp;
      delete presenceData.endTimestamp;
    }

    if (videoTitle !== null) {
      presence.setActivity(presenceData, !video.paused);
    }
  }
});
