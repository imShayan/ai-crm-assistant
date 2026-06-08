import { generateSummary, fetchSummary } from "@/lib/services/summary-service";
import {
  generateRecommendation,
  fetchRecommendation,
} from "@/lib/services/recommendations-service";
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
  const [recommendation, setRecommendation] = useState("");
  const [timeline, setTimeline] = useState<any[]>([]);

  useEffect(() => {
    loadSummary();
    loadRecommendation();
  }, [customer.id, notes]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    onAddNote(customer.id, newNote);

    setNewNote("");
  };

  const handleGenerateSummary = async () => {
    try {
      const generatedSummary = await generateSummary(customer.id);

      setSummary(generatedSummary.summary);

      loadSummary();
    } catch (error) {
      console.error("Error generating summary:", error);
    }
  };

  const handleGenerateRecommendation = async () => {
    try {
      const generatedRecommendation = await generateRecommendation(customer.id);

      if (generatedRecommendation.success) {
        setRecommendation(
          generatedRecommendation.recommendation.recommendation,
        );
      }
    } catch (error) {
      console.error("Error generating recommendation:", error);
    }
  };

  async function loadSummary() {
    const result = await fetchSummary(customer.id);

    const timelineItems = [];

    // Notes
    for (const note of notes) {
      timelineItems.push({
        type: "note",
        content: note.note,
        created_at: note.created_at,
      });
    }

    // Summary
    if (result.success && result.summary) {
      setSummary(result.summary.summary);

      timelineItems.push({
        type: "summary",
        content: result.summary.summary,
        created_at: result.summary.created_at,
      });
    }

    timelineItems.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    setTimeline(timelineItems);
  }

  async function loadRecommendation() {
    const result = await fetchRecommendation(customer.id);

    if (result.success && result.recommendation) {
      setRecommendation(result.recommendation.recommendation);
    }
  }

  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">{customer.name}</h2>

        <p className="text-gray-600 mt-1">{customer.email}</p>

        <p className="text-gray-600">{customer.company}</p>

        <div className="mt-2">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {customer.status}
          </span>
        </div>
      </div>

      {/* AI Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-2">AI Summary</h3>

        <div className="border rounded-lg p-4 bg-white shadow-sm">
          {summary || "No summary generated yet"}
        </div>

        <button
          onClick={handleGenerateSummary}
          className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Generate Summary
        </button>
      </div>
      {/* AI Recommendation */}
      <div>
        <h3 className="text-lg font-semibold mb-2">AI Recommendation</h3>

        <div className="border rounded-lg p-4 bg-white shadow-sm">
          {recommendation || "No recommendation generated yet"}
        </div>

        <button
          onClick={handleGenerateRecommendation}
          className="mt-3 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Generate Recommendation
        </button>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Customer Timeline</h3>

        <div className="space-y-3 mb-4">
          {timeline.length === 0 ? (
            <div className="text-gray-500">No activity yet</div>
          ) : (
            timeline.map((item, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50">
                <div className="text-xs text-gray-500 mb-1">
                  {new Date(item.created_at).toLocaleString()}
                </div>

                <div className="font-medium">
                  {item.type === "note"
                    ? "📝 Note Added"
                    : "🤖 Summary Generated"}
                </div>

                <div className="mt-1 text-gray-700">{item.content}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Note */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Add Note</h3>

        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add note..."
          className="w-full border rounded-lg p-3"
          rows={4}
        />

        <button
          onClick={handleAddNote}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Note
        </button>
      </div>
    </div>
  );
}
