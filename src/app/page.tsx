import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import StatsCard from "@/components/dashboard/stats-card";
import CustomerTable from "@/components/dashboard/customer-table";
import {mockCustomers} from "@/lib/mock-data";


export default function Home() {
  return (
    <div className="flex bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <StatsCard title="Total Customers" value="1,240" />
            <StatsCard title="Revenue" value="$12,400" />
            <StatsCard title="Meetings" value="84" />
          </div>
        </div>

        <CustomerTable customers={mockCustomers} />
      </div>
    </div>
  );
}