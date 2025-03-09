import { useState } from "react";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import PersonalPlaylist from "./PersonalPlaylist";
import ListIcon from "@mui/icons-material/List";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import YouTubeIcon from "@mui/icons-material/YouTube";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function AdminPanel({
  walletAddress,
  contextAddress,
  ownerName,
}: any) {
  const [value, setValue] = useState<number>(0);
  return (
    <div className="bg-white bg-opacity-95 shadow-lg p-2 rounded-xl h-[85dvh] w-[85dvw] gap-[12px] relative flex flex-col items-center justify-center animate-fadeInSlideUp">
      {value === 0 && (
        <PersonalPlaylist
          walletAddress={'0x61d397d2c872f521c0a0bcd13d1cb31ec2c8bc05'}
          contextAddress={contextAddress}
        />
      )}
      {value === 1 && (
        <PersonalPlaylist
          walletAddress={walletAddress}
          contextAddress={contextAddress}
          type="context"
        />
      )}
      {value === 2 && (
        <PersonalPlaylist
          walletAddress={walletAddress}
          contextAddress={contextAddress}
          type="all"
        ></PersonalPlaylist>
      )}
      <BottomNavigation
        color="secondary"
        className="w-full flex-[0.1]"
        showLabels
        value={value}
        onChange={(_event, newValue) => {
          setValue(newValue);
        }}
      >
        <BottomNavigationAction
          color="secondary"
          label="My playlist"
          sx={{
            color: value === 0 ? "#4F5882" : "primary", // Selected color: Orange
            "&.Mui-selected": { color: "#4F5882" }, // Ensure selected style
          }}
          icon={<ListIcon />}
        />
        <BottomNavigationAction
          color="secondary"
          label={ownerName}
          sx={{
            color: value === 1 ? "#4F5882" : "primary", // Selected color: Orange
            "&.Mui-selected": { color: "#4F5882" }, // Ensure selected style
          }}
          icon={<SubscriptionsIcon />}
        />
        <BottomNavigationAction
          color="secondary"
          label="All playlists"
          sx={{
            color: value === 2 ? "#4F5882" : "primary", // Selected color: Orange
            "&.Mui-selected": { color: "#4F5882" }, // Ensure selected style
          }}
          icon={<YouTubeIcon />}
        />
      </BottomNavigation>
    </div>
  );
}
