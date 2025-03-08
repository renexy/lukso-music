import * as React from "react";
import {
  Dialog,
  TextField,
  Button,
  List,
  ListItem,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CreateIcon from "@mui/icons-material/Create";
import LyricsIcon from "@mui/icons-material/Lyrics";
import toast from "react-hot-toast";

export interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (playlistName: string, songs: string[]) => void;
}

export function CreatePlaylistDialog(props: SimpleDialogProps) {
  const { onClose, open, onSubmit } = props;

  const [playlistName, setPlaylistName] = React.useState("");
  const [songURL, setSongURL] = React.useState("");
  const [songs, setSongs] = React.useState<string[]>([]);

  const handleAddSong = async() => {
    const response = await fetch(
      `https://noembed.com/embed?url=${songURL}`
    );
    const data = await response.json();
    
    if (data.error) {
      toast.error('Song not found!');
      return;
    }
    if (songURL.trim() !== "" && !songs.includes(songURL)) {
      setSongs([...songs, songURL]);
      setSongURL("");
    }
  };

  const handleRemoveSong = (url: string) => {
    setSongs(songs.filter((song) => song !== url));
  };

  const handleSubmit = () => {
    if (playlistName.trim() !== "" && songs.length > 0) {
      onSubmit(playlistName, songs);
      setPlaylistName("");
      setSongs([]);
      onClose();
    }
  };

  return (
    <Dialog onClose={onClose} open={open}>
      <div className="flex flex-col gap-[24px] p-6 w-96 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-[#4F5882]">Create a Playlist</h2>

        <TextField
          label="Playlist Name"
          variant="outlined"
          color="secondary"
          fullWidth
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          className="mb-4"
        />

        <TextField
          label="Paste YouTube URL"
          variant="outlined"
          color="secondary"
          fullWidth
          value={songURL}
          onChange={(e) => setSongURL(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddSong()}
          className="mb-2"
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handleAddSong}
          disabled={!songURL.trim()}
          endIcon={<LyricsIcon />}
        >
          Add Song
        </Button>

        <List className="mt-4 max-h-40 overflow-auto">
          {songs.map((song, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton onClick={() => handleRemoveSong(song)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              {song}
            </ListItem>
          ))}
        </List>

        <Button
          onClick={handleSubmit}
          className="mt-4"
          endIcon={<CreateIcon />}
          variant="contained"
          color="secondary"
          disabled={!playlistName.trim() || songs.length === 0}
        >
          Create Playlist
        </Button>
      </div>
    </Dialog>
  );
}
