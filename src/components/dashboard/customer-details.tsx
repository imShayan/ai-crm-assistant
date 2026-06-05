import { generateSummary, fetchSummary } from "@/lib/services/summary-service";
import { Customer } from "@/types/customer";
import { useEffect, useState } from "react";

type Props = {
  customer: Customer;
  notes: any[];
  onAddNote: (customerId: number, note: string) => void;
};

export default function CustomerDetail({ customer, notes, onAddNote }: Props) {
  const [newNote, setNewNote] = useState("");
  const [summary, setSummary] = useState("");

  useEffect(() => {
    loadSummary();
  }, [customer.id]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    onAddNote(customer.id, newNote);

    setNewNote("");
  };

  const handleGenerateSummary = async () => {
    try {
      const generatedSummary = await generateSummary(customer.id);
      setSummary(generatedSummary.summary);
    } catch (error) {
      console.error("Error generating summary:", error);
    }
  };

  async function loadSummary() {
    const result = await fetchSummary(customer.id);
    if (result.success && result.summary) {
      setSummary(result.summary.summary);
    }
  }

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
      <h3 className="font-semibold mt-6">AI Summary</h3>

      <div className="border rounded p-4 mt-2">
        {summary || "No summary generated yet"}
      </div>

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
      <button
        onClick={handleGenerateSummary}
        className="ml-2 bg-green-600 text-white px-4 py-2 rounded"
      >
        Generate Summary
      </button>
    </div>
  );
}
