"use client";
import { useWallet } from "@/context/WalletContext";

export default function WalletConnect() {
  const { account, network, balance, connectWallet } = useWallet();

  return (
    <div className="space-y-2">
      <button
        onClick={connectWallet}
        disabled={!!account}
        className={`px-4 py-2 rounded-lg font-medium ${
          account
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {account ? `Connected: ${account.slice(0, 6)}...` : "Connect Wallet"}
      </button>

      {account && (
        <div className="text-xs text-white">
          {network && <p>Network: {network}</p>}
          {balance && <p>Balance: {parseFloat(balance).toFixed(2)} ETH</p>}
        </div>
      )}
    </div>
  );
}
