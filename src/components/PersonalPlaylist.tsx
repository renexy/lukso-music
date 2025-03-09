/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  addPlaylist,
  getPlaylistByWalletAddress,
  incrementLyxReceived,
  toggleLikePlaylist,
} from "../services/firebase/firebase";
import { Button, CircularProgress, Paper, styled } from "@mui/material";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import { CreatePlaylistDialog } from "./CreatePlaylistDialog";
import Grid from "@mui/material/Grid2";
import toast from "react-hot-toast";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { sendTransaction } from "../services/web3/Interactions";
import { useUpProvider } from "../services/providers/UPProvider";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import MusicPlayer from "./Playlist";

export default function PersonalPlaylist({
  walletAddress,
  contextAddress,
  type,
}: any) {
  console.log(walletAddress, contextAddress);
  const { chainId } = useUpProvider();
  const [loading, setLoading] = useState<boolean>(true);
  const [personalPlaylists, setPersonalPlaylists] = useState<any>([]);
  const [createPlaylistDialogOpen, setCreatePlaylistDialogOpen] =
    useState<boolean>(false);
  const [playlist, setPlaylist] = useState(null);

  const handleClickOpen = () => {
    setCreatePlaylistDialogOpen(true);
  };

  const handleClose = () => {
    setCreatePlaylistDialogOpen(false);
  };

  const handleCreateNewPlaylist = async (
    playlistName: string,
    songs: string[]
  ) => {
    try {
      setLoading(true);
      await addPlaylist(walletAddress, playlistName, songs);
      toast.success("Playlist created!");
      await getWalletPlaylist();
    } catch (err: any) {
      console.error(err);
      toast.error("Error creating playlist!");
      setLoading(false);
    }
  };

  useEffect(() => {
    const getPlaylists = async () => {
      await getWalletPlaylist();
    };

    getPlaylists();
  }, [walletAddress, contextAddress]);

  const getWalletPlaylist = async () => {
    const addressFetch =
      type === "context"
        ? contextAddress
        : type === "all"
        ? null
        : walletAddress;
    const playlistResult = await getPlaylistByWalletAddress(addressFetch);
    setPersonalPlaylists(playlistResult);
    setLoading(false);
  };

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "#F8FAFB",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: "#4F5882",
    height: "45px",
  }));

  const likePlaylist = async (p: any) => {
    setLoading(true);
    await toggleLikePlaylist(walletAddress, p.walletAddress, p.name);
    await getWalletPlaylist();
    setLoading(false);
  };

  const displayLikes = (p: any) => {
    const didILike =
      p.likes &&
      p.likes.length > 0 &&
      p.likes.includes(walletAddress.toLowerCase());

    return (
      <div className="flex flex-col gap-[2px] justify-center items-center w-auto">
        {didILike ? (
          <FavoriteIcon
            fontSize="small"
            className="cursor-pointer"
            onClick={() => likePlaylist(p)}
          ></FavoriteIcon>
        ) : (
          <FavoriteBorderIcon
            fontSize="small"
            className="cursor-pointer"
            onClick={() => likePlaylist(p)}
          ></FavoriteBorderIcon>
        )}
        <span
          style={{
            fontSize: "10px",
          }}
        >
          {p.likes.length || 0}
        </span>
      </div>
    );
  };

  const displayDonations = (p: any) => {
    return (
      <div className="flex flex-col gap-[2px] justify-center items-center w-auto">
        <AttachMoneyIcon
          fontSize="small"
          className="cursor-pointer"
          onClick={() => donateLyx(p)}
        ></AttachMoneyIcon>
        <span
          style={{
            fontSize: "10px",
          }}
        >
          {p.lyxReceived || 0} LYX
        </span>
      </div>
    );
  };

  const donateLyx = async (p: any) => {
    try {
      if (p.walletAddress.toLowerCase() === walletAddress.toLowerCase()) {
        toast.error("You can not send yourself a donation");
        return;
      }
      setLoading(true);
      await sendTransaction(p.walletAddress, chainId);
      await incrementLyxReceived(p.walletAddress, p.name);
      await getWalletPlaylist();
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      toast.error("Transaction failed!");
    }
  };

  const playPlaylist = (p: any) => {
    setPlaylist(p)
  };

  // if (loading || !contextAddress || !walletAddress) {
  //   return (
  //     <div className="flex flex-col flex-[0.9] justify-center items-center">
  //       <CircularProgress color="secondary" />
  //       <p className="mt-4 text-[#4F5882]">Loading music</p>
  //     </div>
  //   );
  // }

  if (playlist) {
    return <MusicPlayer playlist={playlist}></MusicPlayer>
  }

  return (
    <>
      <div className="w-full h-auto flex-[0.9] overflow-y-auto">
        <Grid
          color="secondary"
          className="w-full h-auto p-[12px]"
          container
          rowSpacing={1}
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
        >
          {personalPlaylists.length < 1 && (
            <span className="text-xl font-semibold mb-4 text-[#4F5882] text-center w-full h-auto">
              No playlists yet.
            </span>
          )}
          {personalPlaylists.length > 0 &&
            personalPlaylists.map((p: any, i: number) => (
              <Grid key={i} size={6} sx={{ maxHeight: "45px" }}>
                <Item>
                  <div className="flex w-full h-full justify-between items-center">
                    <span
                      style={{
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                      }}
                    >
                      {p.name || "Unnamed Playlist"}
                      <PlaylistPlayIcon
                        className="cursor-pointer ml-[8px]"
                        onClick={() => playPlaylist(p)}
                      ></PlaylistPlayIcon>
                    </span>
                    <div className="flex gap-[12px]">
                      {displayLikes(p)}
                      {displayDonations(p)}
                    </div>
                  </div>
                </Item>
              </Grid>
            ))}
        </Grid>
      </div>
      <Button
        startIcon={<SubscriptionsIcon />}
        className="flex-[0.1]"
        size="small"
        variant="outlined"
        color="secondary"
        onClick={handleClickOpen}
      >
        Create a playlist
      </Button>
      <CreatePlaylistDialog
        open={createPlaylistDialogOpen}
        onClose={handleClose}
        onSubmit={handleCreateNewPlaylist}
      />
    </>
  );
}
