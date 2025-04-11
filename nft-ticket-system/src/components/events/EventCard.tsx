"use client";
import { useRouter } from 'next/navigation';

type EventCardProps = {
    event: {
        id: string;
        name: string;
        date: string;
        venue: string;
        image: string;
    };
};

export default function EventCard({ event }: EventCardProps) {
    const router = useRouter();

    return (
        <div
            className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-white"
            onClick={() => router.push(`/events/${event.id}`)}
        >
            <img
                src={event.image}
                alt={event.name}
                className="w-full h-48 object-cover"
            />
            <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{event.name}</h3>
                <p className="text-gray-600 mb-1">
                    {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </p>
                <p className="text-sm text-gray-500">{event.venue}</p>
            </div>
        </div>
    );
}