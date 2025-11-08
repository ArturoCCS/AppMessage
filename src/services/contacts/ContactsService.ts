import { getJSON, setJSON } from "@/src/services/storage/Storage";
import type { Contact, ContactsState } from "@/src/types/contacts";

const KEY = "contacts.state";

async function load(): Promise<ContactsState> {
  return getJSON<ContactsState>(KEY, { contacts: [] });
}
async function save(state: ContactsState) {
  return setJSON(KEY, state);
}

export const ContactsService = {
  async list(): Promise<Contact[]> {
    const s = await load();
    return s.contacts;
  },

  async exists(id: string): Promise<boolean> {
    const s = await load();
    return s.contacts.some((c) => c.id === id);
  },

  async addOutgoing(id: string, name?: string): Promise<Contact> {
    const s = await load();
    const prev = s.contacts.find((c) => c.id === id);
    if (prev) return prev;
    const contact: Contact = { id, name: name ?? "Contacto", status: "outgoing" };
    s.contacts.push(contact);
    await save(s);
    return contact;
  },

  async accept(id: string): Promise<Contact | null> {
    const s = await load();
    const c = s.contacts.find((x) => x.id === id);
    if (!c) return null;
    c.status = "accepted";
    await save(s);
    return c;
  },

  async remove(id: string): Promise<void> {
    const s = await load();
    s.contacts = s.contacts.filter((c) => c.id !== id);
    await save(s);
  },

  async updateName(id: string, name: string): Promise<Contact | null> {
    const s = await load();
    const c = s.contacts.find((x) => x.id === id);
    if (!c) return null;
    c.name = name.trim() || c.name;
    await save(s);
    return c;
  },
};