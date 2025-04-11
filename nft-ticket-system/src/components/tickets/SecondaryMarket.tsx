"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { formatEther, parseEther } from "ethers";
import { imageMap } from "@/utils/eventMapping";

type ResaleTicket = {
  ticketId: string;
  eventId: string;
  eventName: string;
  seatType: string;
  price: string;
  date: string;
  venue: string;
  image: string;
};

export default function SecondaryMarket() {
  const { contract, account } = useWallet();
  const [tickets, setTickets] = useState<ResaleTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResaleTickets = async () => {
      if (!contract) return;
      const resaleList: ResaleTicket[] = [];

      try {
        const totalSupply = 10;

        for (let i = 0; i < Number(totalSupply); i++) {
          const price = await contract.resalePrice(i);
          if (price > 0n) {
            const eventId = await contract.ticketToEvent(i);
            const seatType = await contract.ticketToSeatType(i);
            const details = await contract.getEventDetails(eventId);

            resaleList.push({
              ticketId: i.toString(),
              eventId: eventId.toString(),
              eventName: details[0],
              seatType,
              price: formatEther(price),
              date: details[1],
              venue: details[2],
              image: imageMap[Number(eventId)] || "",
            });
          }
        }

        setTickets(resaleList);
      } catch (err) {
        console.error("Failed to load resale tickets", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResaleTickets();
  }, [contract]);

  const buyResaleTicket = async (ticketId: string, price: string) => {
    if (!contract || !account) return;

    try {
      const tx = await contract.buyResaleTicket(ticketId, {
        value: BigInt(parseEther(price)),
      });
      await tx.wait();
      alert("Ticket purchased!");
    } catch (err) {
      console.error("Purchase failed", err);
      alert("Failed to purchase ticket");
    }
  };

  if (loading) return <p className="text-center">Loading resale tickets...</p>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">🎟️ Secondary Market</h2>
      {tickets.length === 0 ? (
        <p className="text-center text-gray-500">
          No tickets are currently listed for resale.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.ticketId}
              className="bg-white border rounded-lg p-4 shadow hover:shadow-md"
            >
              <img
                src={ticket.image}
                alt={ticket.eventName}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <h3 className="text-lg font-bold">{ticket.eventName}</h3>
              <p className="text-sm text-gray-600">{ticket.date}</p>
              <p className="text-sm text-gray-600">{ticket.venue}</p>
              <p className="text-sm text-gray-600">Seat: {ticket.seatType}</p>
              <p className="font-semibold text-blue-600 mt-1">
                {ticket.price} ETH
              </p>
              <button
                onClick={() => buyResaleTicket(ticket.ticketId, ticket.price)}
                className="mt-3 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Buy Ticket
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
