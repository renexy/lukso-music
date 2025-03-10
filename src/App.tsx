/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { useUpProvider } from "./services/providers/UPProvider";
import AdminPanel from "./components/AdminPanel";
import { ERC725 } from "@erc725/erc725.js";
import profileSchema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";

export default function App() {
  const { contextAccounts, accounts, chainId } = useUpProvider();
  const [ready, setReady] = useState<boolean>(false);
  const [ownerName, setOwnerName] = useState<string>("");

  useEffect(() => {
    if (
      contextAccounts &&
      contextAccounts.length > 0 &&
      accounts &&
      accounts.length > 0
    ) {
      setReady(true);

      setOwnerName(
        contextAccounts[0].substring(0, 3) +
          "..." +
          contextAccounts[0].substring(
            contextAccounts[0].length,
            contextAccounts[0].length - 3
          )
      );

      getProfileData();
    } else {
      setReady(false);
    }
  }, [contextAccounts, accounts]);

  const getProfileData = async () => {
    const erc725js = new ERC725(
      profileSchema,
      contextAccounts[0], // Universal Profile address
      chainId === 42 ? "https://rpc.mainnet.lukso.network" : "https://rpc.testnet.lukso.network",
      {
        ipfsGateway: "https://api.universalprofile.cloud/ipfs/",
      }
    );
    const encodedProfileData = await erc725js.getData();
    try {
      if (!encodedProfileData || encodedProfileData.length < 1) return;
      const link = encodedProfileData!.find(
        (e) => e.dynamicName === "LSP3Profile"
      );
      const value = link?.value as any;
      const gatewayUrl = value.url?.replace("ipfs://", "https://ipfs.io/ipfs/");
      const response = await fetch(gatewayUrl);
      if (!response.ok) throw new Error("Failed to fetch IPFS data");

      const text = await response.json();
      if (text.LSP3Profile.name && text.LSP3Profile.name.length > 0)
        setOwnerName(text.LSP3Profile.name);
    } catch (error) {
      console.error("Error fetching IPFS data:", error);
    }
  };

  if (!ready) {
    return (
      <div className="bg-white bg-opacity-95 shadow-lg p-2 rounded-xl h-[85dvh] w-[85dvw] relative flex flex-col items-center justify-center animate-fadeInSlideUp">
        <CircularProgress color="secondary" />
        <p className="mt-4 text-[#4F5882]">Connect wallet to continue</p>
      </div>
    );
  }

  return (
    <AdminPanel
      walletAddress={accounts[0]}
      contextAddress={contextAccounts[0]}
      ownerName={ownerName}
    />
  );
}
