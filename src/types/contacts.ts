
export type ContactStatus = "accepted" | "outgoing" | "incoming" | "blocked";

export type Contact = {
  id: string;
  name: string;
  status: ContactStatus;
};

export type ContactsState = {
  contacts: Contact[];
};