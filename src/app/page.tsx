"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import StatsCard from "@/components/dashboard/stats-card";
import CustomerTable from "@/components/dashboard/customer-table";
import {mockCustomers} from "@/lib/mock-data";
import AddCustomerForm from "@/components/dashboard/add-customer-form";


export default function Home() {
  const [customers, setCustomers] = useState(mockCustomers);
  const handleAddCustomer = (customer: { name: string; email: string; company: string }) => {
  const newCustomer = {
    id: customers.length + 1,
    ...customer,
    status: "Pending",
  };
  setCustomers([...customers, newCustomer]);
};

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

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Customers</h2>
          </div>

          <CustomerTable customers={customers} />

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Add New Customer</h3>
            <AddCustomerForm onAddCustomer={handleAddCustomer} />
          </div>
        </div>  
        
      </div>
    </div>
  );
}