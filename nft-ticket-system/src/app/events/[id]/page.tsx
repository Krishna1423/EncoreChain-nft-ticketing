"use client";
import { useWallet } from "@/context/WalletContext";
import { useState, useEffect } from "react";
import TicketInterface from "@/components/tickets/TicketInterface";
import { ethers, formatEther, parseEther } from "ethers";
import { getContract } from "@/utils/contract";

type Event = {
  id: string;
  name: string;
  date: string;
  venue: string;
  image: string;
  ticketPriceRange: string;
};

export default function EventPage({ params }: { params: { id: string } }) {
  const { account, provider } = useWallet();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const contract = getContract(provider);
        const eventId = parseInt(params.id);

        const eventData = await contract.getEventDetails(eventId);

        // Map your eventId to an IPFS image
        const imageMap: Record<number, string> = {
          0: "https://aquamarine-above-viper-774.mypinata.cloud/ipfs/bafybeihpu2ve2uwt367wz5464whtqwmbfi2orgdpoiqxs6s6f5lxy5djuq",
          1: "https://aquamarine-above-viper-774.mypinata.cloud/ipfs/bafybeieeh5mgpdxenbxbs5l4jdpw7jll3dhnqla5qawcki5pxsbirkvfqm",
        };

        const seatTypes = ["VIP", "General", "Front Row", "Back Row", "Floor"];
        let minPrice = parseEther("1000000");
        let maxPrice = parseEther("0");

        for (const type of seatTypes) {
          try {
            const seat = await contract.getSeatCategory(eventId, type);
            const price = seat[0];

            if (price > 0n) {
              if (price < minPrice) minPrice = price;
              if (price > maxPrice) maxPrice = price;
            }
          } catch {
            // Ignore seat types that aren't present
          }
        }

        const priceRange = `${formatEther(minPrice)} - ${formatEther(
          maxPrice
        )}`;

        setEvent({
          id: eventId.toString(),
          name: eventData[0],
          date: eventData[1],
          venue: eventData[2],
          image: imageMap[eventId],
          ticketPriceRange: priceRange,
        });
      } catch (err) {
        console.error("Failed to fetch event:", err);
      }
    };

    if (params.id && provider) fetchEvent();
  }, [params.id, provider]);

  if (!event) return <div className="text-center py-8">Loading event...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <img
            src={event.image}
            alt={event.name}
            className="rounded-lg w-full shadow-md"
          />
        </div>
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
          <p className="text-xl text-gray-600 mb-2">
            {new Date(event.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="text-sm text-gray-500 mb-4">{event.venue}</p>
          <p className="text-md font-medium text-gray-700 mb-4">
            🎟️ Ticket Price Range:{" "}
            <span className="text-blue-600">{event.ticketPriceRange} ETH</span>
          </p>

          <TicketInterface eventId={event.id} disabled={!account} />
        </div>
      </div>
    </div>
  );
}
