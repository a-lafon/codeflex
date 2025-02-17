export type Ticket = {
  title: string;
  description?: string;
  id: string;
};

export type TicketWithReview = Ticket & {
  requirements: string[];
  summary: string;
};
