/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import { Button } from "@mui/material";
import { PlayArrow, Pause, SkipNext, SkipPrevious } from "@mui/icons-material";

export default function MusicPlayer({ playlist }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoData, setVideoData] = useState<any[]>([]);
  const playerRef = useRef<any | null>(null);
  const [isUserManuallyPaused, setIsUserManuallyPaused] = useState(false);
  const [isPlayerInitialized, setIsPlayerInitialized] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Initializing...");

  const extractVideoIds = (urls: string[]): any[] => {
    return urls.map((url) => {
      const parts = url.split("v=");
      return parts.length > 1 ? parts[1].substring(0, 11) : null;
    }).filter(Boolean);
  };

  useEffect(() => {
    console.log("useEffect [playlist]: Fetching video titles");
    const fetchVideoTitles = async () => {
      const musicToLoad = playlist.music;
      const videoIds = extractVideoIds(musicToLoad);
      if (!videoIds || videoIds.length < 1) {
        setStatusMessage("No videos available.");
        return;
      }
      const results = (await Promise.all(
        videoIds.map(async (video: string) => {
          try {
            const response = await fetch(
              `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${video}`
            );
            const data = await response.json();
            return data.error ? null : { id: video, title: data.title };
          } catch (error) {
            console.error("Fetch error:", error);
            return null;
          }
        })
      )) as any[];
      const res = results.filter(Boolean);
      console.log("Fetched videoData:", res);
      setVideoData(res);
      setStatusMessage(`Loaded ${res.length} videos.`);
    };
    fetchVideoTitles();
  }, [playlist]);

  const onReady = (event: any) => {
    console.log("onReady: Player initialized, videoId:", videoData[currentIndex]?.id, "isPlaying:", isPlaying, "hasUserInteracted:", hasUserInteracted);
    playerRef.current = event.target;
    playerRef.current.setVolume(100);
    setStatusMessage(`Volume set to: ${playerRef.current.getVolume()}`);
    setIsPlayerInitialized(true);
    if (isPlaying && hasUserInteracted && !isUserManuallyPaused) {
      console.log("onReady: Auto-playing video ID:", videoData[currentIndex]?.id);
      tryPlayVideo();
    }
  };

  const tryPlayVideo = () => {
    if (playerRef.current) {
      try {
        const playPromise = playerRef.current.playVideo();
        if (playPromise !== undefined) {
          playPromise.catch((error: any) => {
            setStatusMessage("Playback blocked. Click Play again.");
            console.error("Playback blocked:", error);
          });
        }
      } catch (error) {
        setStatusMessage("Playback error. Click Play again.");
        console.error("Playback error:", error);
      }
    }
  };

  const togglePlayPause = () => {
    if (playerRef.current && isPlayerInitialized) {
      console.log("togglePlayPause: isPlaying:", isPlaying, "isUserManuallyPaused:", isUserManuallyPaused);
      setHasUserInteracted(true);

      // Resume AudioContext
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === "suspended") {
        audioContext.resume().then(() => {
          setStatusMessage("AudioContext resumed.");
          console.log("AudioContext resumed.");
        });
      }

      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsUserManuallyPaused(true);
        setStatusMessage("Paused.");
      } else {
        try {
          playerRef.current.setVolume(100);
          setStatusMessage(`Volume set to: ${playerRef.current.getVolume()}`);
          tryPlayVideo();
        } catch (error) {
          setStatusMessage("Playback error on toggle. Try again.");
          console.error("Playback error on toggle:", error);
        }
        setIsUserManuallyPaused(false);
      }
      setIsPlaying(!isPlaying);
    } else {
      setStatusMessage("Player not ready. Please wait.");
      console.warn("Player not ready or initialized in togglePlayPause");
    }
  };

  const nextSong = () => {
    if (videoData.length > 0) {
      const newIndex = (currentIndex + 1) % videoData.length;
      console.log("nextSong: Changing index, currentIndex:", currentIndex, "New index:", newIndex);
      setCurrentIndex(newIndex);
      setIsUserManuallyPaused(false);
      setIsPlaying(true);
      setIsPlayerInitialized(false);
      setHasUserInteracted(true);
      setStatusMessage(`Switching to next song (Index: ${newIndex})`);
    } else {
      setStatusMessage("No videos available for next song.");
      console.warn("Cannot proceed to next song: No videos available");
    }
  };

  const prevSong = () => {
    if (videoData.length > 0) {
      const newIndex = (currentIndex - 1 + videoData.length) % videoData.length;
      console.log("prevSong: Changing index, currentIndex:", currentIndex, "New index:", newIndex);
      setCurrentIndex(newIndex);
      setIsUserManuallyPaused(false);
      setIsPlaying(true);
      setIsPlayerInitialized(false);
      setHasUserInteracted(true);
      setStatusMessage(`Switching to previous song (Index: ${newIndex})`);
    } else {
      setStatusMessage("No videos available for previous song.");
      console.warn("Cannot proceed to previous song: No videos available");
    }
  };

  const onPlayerStateChange = (event: any) => {
    const states: any = {
      0: "ENDED",
      1: "PLAYING",
      2: "PAUSED",
      3: "BUFFERING",
      5: "CUED",
    };
    console.log(
      "onPlayerStateChange: State:",
      event.data,
      "isPlaying:",
      isPlaying,
      "isUserManuallyPaused:",
      isUserManuallyPaused,
      "isPlayerInitialized:",
      isPlayerInitialized,
      "currentIndex:",
      currentIndex
    );
    setStatusMessage(`Player state: ${states[event.data] || "UNKNOWN"}`);
    if (isPlayerInitialized) {
      if (event.data === 1) {
        setIsPlaying(true);
      } else if (event.data === 2) {
        setIsPlaying(false);
      } else if (event.data === 0) {
        console.log("Video ended, triggering nextSong, currentIndex:", currentIndex);
        nextSong();
      }
    }
  };

  if (videoData.length === 0) return <p>{statusMessage}</p>;

  return (
    <div
      className="flex-[0.9]"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        padding: "24px",
        color: "white",
        borderRadius: "12px",
      }}
    >
      <h2 style={{ textAlign: "center", maxWidth: "400px", color: "#4F5882" }}>
        {videoData[currentIndex].title}
      </h2>
      <YouTube
        key={videoData[currentIndex].id}
        videoId={videoData[currentIndex].id}
        opts={{ playerVars: { autoplay: 0, controls: 0, enablejsapi: 1, origin: window.location.origin }, host: "https://www.youtube-nocookie.com" }}
        onReady={onReady}
        onStateChange={onPlayerStateChange}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
      <div style={{ display: "flex", gap: "16px" }}>
        <Button onClick={prevSong} variant="contained" color="secondary">
          <SkipPrevious />
        </Button>
        <Button onClick={togglePlayPause} variant="contained" color="primary">
          {isPlaying ? <Pause /> : <PlayArrow />}
        </Button>
        <Button onClick={nextSong} variant="contained" color="secondary">
          <SkipNext />
        </Button>
      </div>
    </div>
  );
}