import { Customer } from "@/types/customer";
import { useState } from "react";

type Props = {
  customer: Customer;
  notes: any[];
  onAddNote: (customerId: number, note: string) => void;
};

export default function CustomerDetail({ customer, notes, onAddNote }: Props) {
  const [newNote, setNewNote] = useState("");
  const handleAddNote = () => {
    if (!newNote.trim()) return;

    onAddNote(customer.id, newNote);

    setNewNote("");
  };

  return (
    <div>
      <h2>{customer.name}</h2>

      <p>{customer.email}</p>

      <p>{customer.company}</p>

      <hr />

      <h3>Notes</h3>

      {notes.map((note) => (
        <div key={note.id}>
          <p>{note.note}</p>
        </div>
      ))}

      <textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Add note..."
        className="w-full border p-2 rounded"
      />
      <button
        onClick={handleAddNote}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Note
      </button>
    </div>
  );
}
