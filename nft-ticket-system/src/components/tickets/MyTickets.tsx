"use client";
import { useWallet } from "@/context/WalletContext";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { imageMap } from "@/utils/eventMapping";

type Ticket = {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  venue: string;
  seatType: string;
  used: boolean;
  wasResold: boolean;
  image: string;
};

export default function MyTickets() {
  const { account, contract } = useWallet();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [resalePrice, setResalePrice] = useState<{ [key: string]: string }>({});
  const [status, setStatus] = useState<{ [key: string]: string }>({});

  const fetchTickets = async () => {
    if (!contract || !account) return;

    try {
      const balance = await contract.balanceOf(account);
      const ownedTickets: Ticket[] = [];

      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await contract.tokenOfOwnerByIndex(account, i);
          const eventId = await contract.ticketToEvent(tokenId);
          const seatType = await contract.ticketToSeatType(tokenId);
          const isUsed = await contract.isTicketUsed(tokenId);
          const wasResold = await contract.resold(tokenId);
          const eventDetails = await contract.getEventDetails(eventId);

          ownedTickets.push({
            id: tokenId.toString(),
            eventId: eventId.toString(),
            eventName: eventDetails[0],
            eventDate: eventDetails[1],
            venue: eventDetails[2],
            seatType,
            used: isUsed,
            wasResold: wasResold,
            image: imageMap[Number(eventId)] || "",
          });
        } catch {
          // ignore non-existing token IDs
        }
      }

      setTickets(ownedTickets);
    } catch (error) {
      console.error("Failed to fetch owned tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleListForResale = async (ticketId: string) => {
    if (!contract || !account) return;

    try {
      const price = resalePrice[ticketId];
      if (!price || isNaN(Number(price))) {
        setStatus((prev) => ({ ...prev, [ticketId]: "Invalid price" }));
        return;
      }

      const tx = await contract.listForResale(
        ticketId,
        ethers.parseEther(price)
      );
      await tx.wait();
      setStatus((prev) => ({ ...prev, [ticketId]: "Listed!" }));
    } catch (error: any) {
      let message = "Unknown error";

      if (error?.reason) {
        message = error.reason;
      } else if (error?.message) {
        const match = error.message.match(/execution reverted: (.*?)("|$)/);
        message = match?.[1] || error.message;
      }

      setStatus((prev) => ({
        ...prev,
        [ticketId]: "Listing failed: " + message,
      }));
    }
  };

  useEffect(() => {
    if (contract && account) {
      fetchTickets();
    }
  }, [contract, account]);

  if (!account) {
    return (
      <p className="text-center text-gray-600">
        Connect your wallet to see your tickets.
      </p>
    );
  }

  if (loading) {
    return <p className="text-center text-gray-500">Loading your tickets...</p>;
  }

  if (tickets.length === 0) {
    return (
      <p className="text-center text-gray-500">
        You don't own any tickets yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 pb-8">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="bg-white rounded-lg shadow p-4 border hover:shadow-md transition"
        >
          <img
            src={ticket.image}
            alt={ticket.eventName}
            className="rounded w-full h-48 object-cover mb-4"
          />
          <h3 className="text-lg font-bold">{ticket.eventName}</h3>
          <p className="text-sm text-gray-600">{ticket.venue}</p>
          <p className="text-sm text-gray-600 mb-2">
            {new Date(ticket.eventDate).toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
            Seat: {ticket.seatType}
          </span>
          <span
            className={`inline-block ml-2 px-2 py-1 text-xs rounded font-semibold ${
              ticket.used
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {ticket.used ? "Used" : "Valid"}
          </span>

          {!ticket.used && !ticket.wasResold && (
            <div className="mt-4">
              <input
                type="number"
                min="0"
                step="0.01"
                value={resalePrice[ticket.id] || ""}
                onChange={(e) =>
                  setResalePrice((prev) => ({
                    ...prev,
                    [ticket.id]: e.target.value,
                  }))
                }
                className="border rounded px-2 py-1 w-full text-sm"
                placeholder="Set resale price (ETH)"
              />
              <button
                onClick={() => handleListForResale(ticket.id)}
                className="mt-2 w-full bg-yellow-500 text-white text-sm py-2 px-4 rounded hover:bg-yellow-600 transition"
              >
                List for Resale
              </button>
              {status[ticket.id] && (
                <p className="mt-1 text-xs text-gray-500">
                  {status[ticket.id]}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
