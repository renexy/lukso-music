/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export async function getPlaylistByWalletAddress(walletAddress: string) {
  const wa = walletAddress?.toLowerCase();
  const playlistsRef = collection(db, "playlists");;

  const q = walletAddress
  ? query(playlistsRef, where("walletAddress", "==", wa))
  : playlistsRef;

  try {
    const querySnapshot = await getDocs(q);

    const playlists = querySnapshot.docs.map((doc) => doc.data());
    return playlists;
  } catch (error) {
    console.error("Error getting playlists:", error);
    return [];
  }
}

export async function addPlaylist(
  walletAddress: string,
  playlistName: string,
  songs: string[]
) {
  const wallet = walletAddress.toLowerCase();
  const playlistsRef = collection(db, "playlists");

  const q = query(
    playlistsRef,
    where("walletAddress", "==", wallet),
    where("name", "==", playlistName) // Check for duplicate name
  );

  try {
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      console.log("A playlist with this name already exists for this wallet.");
      throw new Error("exists");
    }

    if (!querySnapshot.empty) {
      console.log("Playlist already exists for this wallet address.");
    } else {
      const docRef = await addDoc(playlistsRef, {
        walletAddress: wallet,
        name: playlistName,
        music: songs,
        likes: 0,
        lyxRecieved: 0,
      });

      console.log("Playlist added with ID:", docRef.id);
    }
  } catch (error) {
    console.error("Error adding playlist:", error);
    return Promise.reject(error);
  }
}

export async function toggleLikePlaylist(
  likerAddress: string,
  ownerAddress: string,
  playlistName: string
) {
  const liker = likerAddress.toLowerCase();
  const owner = ownerAddress.toLowerCase();
  const playlistsRef = collection(db, "playlists");

  const q = query(
    playlistsRef,
    where("walletAddress", "==", owner),
    where("name", "==", playlistName)
  );

  try {
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const playlistDoc = querySnapshot.docs[0];
      const playlistRef = doc(db, "playlists", playlistDoc.id);

      const playlistData = playlistDoc.data();
      const likes = playlistData.likes || [];

      // Check if the likerAddress is already in the likes array
      const isLiked = likes.includes(liker);

      if (isLiked) {
        // User has already liked, so we remove it (unlike)
        const updatedLikes = likes.filter(
          (address: string) => address !== liker
        );
        await updateDoc(playlistRef, { likes: updatedLikes });
        console.log("You have unliked this playlist.");
      } else {
        // User hasn't liked, so we add it (like)
        const updatedLikes = [...likes, liker];
        await updateDoc(playlistRef, { likes: updatedLikes });
        console.log("You have liked this playlist.");
      }

      console.log("Playlist updated successfully!");
    } else {
      console.log("Playlist not found for this owner address.");
    }
  } catch (error) {
    console.error("Error toggling like on playlist:", error);
    throw new Error("Error toggling like on playlist");
  }
}

export async function incrementLyxReceived(walletAddress: string, playlistName: string) {
  const address = walletAddress.toLowerCase(); // Ensure consistent casing

  const playlistsRef = collection(db, "playlists");

  const q = query(
    playlistsRef,
    where("walletAddress", "==", address),
    where("name", "==", playlistName)
  );

  try {
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const playlistDoc = querySnapshot.docs[0];
      const playlistRef = doc(db, "playlists", playlistDoc.id);

      await updateDoc(playlistRef, {
        lyxReceived: increment(1),
      });

      console.log(`lyxReceived incremented successfully for playlist "${playlistName}"!`);
    } else {
      console.log(`No playlist found for wallet address "${walletAddress}" and name "${playlistName}".`);
    }
  } catch (error) {
    console.error("Error incrementing lyxReceived:", error);
    throw new Error("Error incrementing lyxReceived");
  }
}

