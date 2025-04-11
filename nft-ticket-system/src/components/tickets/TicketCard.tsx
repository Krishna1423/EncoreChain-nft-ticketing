"use client";
import { useEffect, useState } from "react";
import { getContract } from "@/utils/contract";
import { useWallet } from "@/context/WalletContext";
import { formatEther } from "ethers";

export default function TicketCard({ ticket }: { ticket: any }) {
  const { provider } = useWallet();
  const [eventInfo, setEventInfo] = useState<any>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      const contract = getContract(provider);
      const details = await contract.getEventDetails(ticket.eventId);
      const seat = await contract.getSeatCategory(
        ticket.eventId,
        ticket.seatType
      );
      setEventInfo({
        name: details[0],
        date: details[1],
        venue: details[2],
        price: formatEther(seat.price),
      });
    };
    if (provider) fetchEvent();
  }, [provider, ticket]);

  if (!eventInfo) return null;

  return (
    <div className="border p-4 rounded-lg shadow-md bg-white">
      <h3 className="text-xl font-bold">{eventInfo.name}</h3>
      <p className="text-sm text-gray-600">{eventInfo.date}</p>
      <p className="text-sm text-gray-600">{eventInfo.venue}</p>
      <p className="mt-2">
        <span className="font-semibold">Seat Type:</span> {ticket.seatType}
      </p>
      <p>
        <span className="font-semibold">Price:</span> {eventInfo.price} ETH
      </p>
      <p
        className={ticket.isUsed ? "text-red-500 mt-2" : "text-green-600 mt-2"}
      >
        {ticket.isUsed ? "Used" : "Active"}
      </p>
    </div>
  );
}
