import { useState } from "react";
import { getNotes, createNote } from "@/lib/services/note-service";
export function useNotes() {
  //state
  const [customerNotes, setCustomerNotes] = useState([]);
  //function
  const addNote = async (customerId: number, note: string) => {
    try {
      await createNote(customerId, note);
      await loadNotes(customerId)
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const loadNotes = async (customerId: number) => {
    const response = await getNotes(customerId);
    setCustomerNotes(response.notes);
  };
  return {
    // what you want to expose
    customerNotes,
    addNote,
    loadNotes,
  };
}
