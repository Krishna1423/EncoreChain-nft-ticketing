"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { formatEther, parseEther } from "ethers";
import EventCard from "./EventCard";
import { imageMap } from "@/utils/eventMapping";

interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  image: string;
  ticketPrice: string; // price range
}

export default function EventList() {
  const { contract } = useWallet();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!contract) return;

      const seatTypes = ["VIP", "General", "Front Row", "Back Row", "Floor"];
      const result: Event[] = [];

      for (let eventId = 0; eventId < 2; eventId++) {
        try {
          const details = await contract.getEventDetails(eventId);

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
            } catch (err) {
              // Skip if seat type doesn't exist
            }
          }

          const priceRange = `${formatEther(minPrice)} - ${formatEther(
            maxPrice
          )}`;

          result.push({
            id: eventId.toString(),
            name: details[0],
            date: details[1],
            venue: details[2],
            image: imageMap[eventId],
            ticketPrice: priceRange,
          });
        } catch (err) {
          console.error(`Error fetching event ${eventId}`, err);
        }
      }

      setEvents(result);
    };

    fetchEvents();
  }, [contract]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
