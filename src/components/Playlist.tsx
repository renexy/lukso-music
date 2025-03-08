/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import { Button } from "@mui/material";
import { PlayArrow, Pause, SkipNext, SkipPrevious } from "@mui/icons-material";

export default function MusicPlayer({ playlist }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoData, setVideoData] = useState<any[]>([]);
  const playerRef = useRef<any | null>(null);

  const extractVideoIds = (urls: string[]): any[] => {
    return urls.map((url) => {
      const parts = url.split("v="); // Split by "v="
      return parts.length > 1 ? parts[1].substring(0, 11) : null; // Grab the ID after "v=" and limit it to 11 chars
    }).filter(Boolean); // Filter out null values
  };

  useEffect(() => {
    const fetchVideoTitles = async () => {
      const musicToLoad = playlist.music;
      const videoIds = extractVideoIds(musicToLoad);
      if (!videoIds || videoIds.length < 1) return;
      const results =
        ((await Promise.all(
          videoIds.map(async (video: string) => {
            try {
              const response = await fetch(
                `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${video}`
              );
              const data = await response.json();
              return data.error ? null : { id: video, title: data.title };
            } catch {
              return null;
            }
          })
        )) as any[]) || [];
      const res = results.filter(Boolean);
      setVideoData(res); // Remove invalid videos
    };
    fetchVideoTitles();
  }, [playlist]);

  const onReady = (event: any) => {
    console.log("Player ready:", event); // Debug log
    console.log(event);
    console.log("lol");
    playerRef.current = event.target;
    playerRef.current!.setVolume(100);
    if (isPlaying && videoData.length > 0)
      playerRef.current.loadVideoById(videoData[currentIndex].id);
  };

  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    } else {
      console.log("Player not ready for play/pause"); // Debug log
    }
  };

  const nextSong = () => {
    if (videoData.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % videoData.length);
    }
  };

  const prevSong = () => {
    if (videoData.length > 0) {
      setCurrentIndex(
        (prev) => (prev - 1 + videoData.length) % videoData.length
      );
    }
  };

  useEffect(() => {
    if (playerRef.current && videoData.length > 0) {
      const pr = playerRef.current;
      pr.loadVideoById(videoData[currentIndex].id);
      if (isPlaying) pr.playVideo();
    } else {
      console.log("Player not ready or videoData empty"); // Debug log
    }
  }, [currentIndex, isPlaying, videoData]);

  if (videoData.length === 0) return <p>Loading videos...</p>;

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
        videoId={videoData[0].id} // Use a static initial videoId to avoid re-rendering
        opts={{ playerVars: { autoplay: 1, controls: 0 } }}
        onReady={(event: any) => {
          console.log("YouTube Player is Ready:", event);
          onReady(event);
        }}
        onEnd={nextSong}
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
        }} // Off-screen instead of display: none
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
