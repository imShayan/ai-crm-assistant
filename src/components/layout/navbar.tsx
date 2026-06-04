import { useRouter } from "next/navigation";
import { signOut } from "@/lib/services/auth-service";

export default function Navbar() {
  const router = useRouter();

  const handleSignout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="w-full h-16 bg-white border-b flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
          S
        </div>
        <button
          onClick={handleSignout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
