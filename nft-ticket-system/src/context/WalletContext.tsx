"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { BrowserProvider, Contract, ethers } from "ethers";
import contractABI from "@/abi/NFTTicket.json";

type WalletContextType = {
  account: string | null;
  network: string | null;
  balance: string | null;
  contract: Contract | null;
  provider: BrowserProvider | null;
  connectWallet: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType>({
  account: null,
  network: null,
  balance: null,
  contract: null,
  provider: null,
  connectWallet: async () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null); // ✅ added provider

  const initializeContract = async (provider: BrowserProvider) => {
    const signer = await provider.getSigner();
    const contractAddress = "0xfE8405eB5F951EcED65F9f2565aD17A8561e963F"; // Replace with actual address
    return new Contract(contractAddress, contractABI, signer);
  };

  const fetchWalletData = async () => {
    if (!window.ethereum) return;

    try {
      const newProvider = new BrowserProvider(window.ethereum);
      setProvider(newProvider); // ✅ Save provider to state

      const accounts = await newProvider.listAccounts();
      if (accounts.length > 0) {
        const account = accounts[0].address;
        const network = await newProvider.getNetwork();
        const balance = await newProvider.getBalance(account);
        const contract = await initializeContract(newProvider);

        setAccount(account);
        setNetwork(network.name);
        setBalance(ethers.formatEther(balance));
        setContract(contract);
      }
    } catch (err) {
      console.error("Failed to fetch wallet data:", err);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await fetchWalletData();
    } catch (err) {
      console.error("User rejected connection:", err);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      fetchWalletData();
      window.ethereum.on("accountsChanged", fetchWalletData);
      window.ethereum.on("chainChanged", () => window.location.reload());

      return () => {
        window.ethereum?.removeListener("accountsChanged", fetchWalletData);
        window.ethereum?.removeListener("chainChanged", () =>
          window.location.reload()
        );
      };
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{ account, network, balance, contract, provider, connectWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
