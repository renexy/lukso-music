import { parseUnits, createWalletClient, custom } from "viem";
import { lukso, luksoTestnet } from "viem/chains";
import { createClientUPProvider } from "@lukso/up-provider";

export const sendTransaction = async (
  recipientAddress: string,
  chainId: number,
  amount: number = 1
) => {
  const provider = createClientUPProvider();

  const client = createWalletClient({
    chain: (chainId === 42 ? lukso : luksoTestnet),
    transport: custom(provider),
  });

  try {
    const accounts = await client.getAddresses();
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found");
    }

    const tx = await client.sendTransaction({
      account: accounts[0],
      to: recipientAddress as `0x${string}`,
      value: parseUnits(amount.toString(), 18),
    });

    return tx;
  } catch (err) {
    console.error("Transaction failed:", err);
    throw err;
  }
};
