"use client";
import { useWallet } from "@/context/WalletContext";
import { useEffect, useState } from "react";
import { formatEther, parseEther } from "ethers";
import { getTokenURIByEventId } from "@/utils/eventMapping";

interface TicketInterfaceProps {
  eventId: string;
  disabled?: boolean;
}

interface SeatCategory {
  type: string;
  price: string;
  totalSeats: number;
  soldSeats: number;
}

export default function TicketInterface({
  eventId,
  disabled = false,
}: TicketInterfaceProps) {
  const { account, contract } = useWallet();
  const [seatCategories, setSeatCategories] = useState<SeatCategory[]>([]);
  const [selectedSeatType, setSelectedSeatType] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [pricePerTicket, setPricePerTicket] = useState<string>("0");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    const fetchSeatTypes = async () => {
      try {
        if (!contract) return;

        const allSeatTypes = [
          "VIP",
          "General",
          "Front Row",
          "Back Row",
          "Floor",
        ];

        const results: SeatCategory[] = [];

        for (let type of allSeatTypes) {
          try {
            const [price, total, sold] = await contract.getSeatCategory(
              eventId,
              type
            );
            if (Number(total) > 0) {
              results.push({
                type,
                price: formatEther(price),
                totalSeats: Number(total),
                soldSeats: Number(sold),
              });
            }
          } catch (err) {
            continue;
          }
        }

        setSeatCategories(results);
        if (results.length > 0) {
          setSelectedSeatType(results[0].type);
          setPricePerTicket(results[0].price);
        }
      } catch (error) {
        console.error("Failed to fetch seat types:", error);
      }
    };

    fetchSeatTypes();
  }, [contract, eventId]);

  const handleBuy = async () => {
    if (!contract || !selectedSeatType || quantity < 1) return;

    try {
      setIsProcessing(true);
      setMessage(null);
      const totalPrice = (parseFloat(pricePerTicket) * quantity).toFixed(6);
      const tokenURI = getTokenURIByEventId(eventId);

      const tx = await contract.purchaseTickets(
        eventId,
        selectedSeatType,
        tokenURI,
        quantity,
        { value: parseEther(totalPrice) }
      );
      await tx.wait();

      setMessage({
        text: `Successfully purchased ${quantity} ticket(s)!`,
        type: "success",
      });
    } catch (err) {
      setMessage({ text: "Purchase failed. Please try again.", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-lg font-semibold mb-2">Buy Tickets</h2>

      {seatCategories.length > 0 ? (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seat Type
            </label>
            <select
              value={selectedSeatType}
              onChange={(e) => {
                const selected = seatCategories.find(
                  (s) => s.type === e.target.value
                );
                if (selected) {
                  setSelectedSeatType(selected.type);
                  setPricePerTicket(selected.price);
                }
              }}
              className="w-full border rounded p-2"
              disabled={disabled || isProcessing}
            >
              {seatCategories.map((seat) => (
                <option key={seat.type} value={seat.type}>
                  {seat.type} — {seat.price} ETH
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.min(10, Math.max(1, Number(e.target.value) || 1))
                )
              }
              className="w-full border rounded p-2"
              disabled={disabled || isProcessing}
            />
          </div>

          <p className="text-sm text-gray-700 mb-2">
            <strong>Total:</strong>{" "}
            {(parseFloat(pricePerTicket) * quantity).toFixed(3)} ETH
          </p>

          <button
            onClick={handleBuy}
            disabled={disabled || isProcessing}
            className="w-full py-2 px-4 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300"
          >
            {isProcessing ? "Processing..." : "Buy Ticket(s)"}
          </button>
        </>
      ) : (
        <p>No seat types found for this event.</p>
      )}

      {message && (
        <div
          className={`mt-4 p-3 rounded text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {disabled && !account && (
        <div className="mt-4 text-sm text-amber-600">
          Connect your wallet to continue
        </div>
      )}
    </div>
  );
}
