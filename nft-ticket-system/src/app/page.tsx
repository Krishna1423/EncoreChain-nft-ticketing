import MyTickets from "@/components/tickets/MyTickets";
import EventList from "@/components/events/EventList";

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-3xl font-bold mb-8 px-4">Upcoming Events</h2>
      <EventList />
      <h2 id="my-tickets" className="text-3xl font-bold mt-12 mb-8 px-4">
        My Tickets
      </h2>
      <MyTickets />
    </div>
  );
}
