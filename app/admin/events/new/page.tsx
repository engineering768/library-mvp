import { ArrowLeft } from "lucide-react";
import { EventForm } from "@/components/admin/event-form";
import { LinkButton } from "@/components/ui/link-button";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <LinkButton href="/admin/events" variant="ghost" className="-ml-2">
        <ArrowLeft className="size-4" />
        Back to Events
      </LinkButton>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Event</h1>
        <p className="text-sm text-muted-foreground mt-1">Setting up a new event — add the title, date, time, and location so it appears on the public events page for members to see.</p>
      </div>
      <EventForm mode="create" />
    </div>
  );
}
