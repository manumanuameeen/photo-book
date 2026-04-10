import { createFileRoute } from '@tanstack/react-router';
import BookingDetailsPage from '../../../modules/photographer/pages/BookingDetails';

export const Route = createFileRoute('/photographer/__layout/bookings/$id')({
  validateSearch: (search: Record<string, unknown>): { source?: string } => {
    return {
      source: (search.source as string) || undefined,
    }
  },
  component: BookingDetailsRoute,
});

function BookingDetailsRoute() {
  const { id } = Route.useParams();
  return <BookingDetailsPage bookingId={id} />;
}

