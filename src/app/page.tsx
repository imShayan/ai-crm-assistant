"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import StatsCard from "@/components/dashboard/stats-card";
import CustomerTable from "@/components/dashboard/customer-table";
import {mockCustomers} from "@/lib/mock-data";
import AddCustomerForm from "@/components/dashboard/add-customer-form";
import Modal from "@/components/ui/modal";

export default function Home() {
  const [customers, setCustomers] = useState(mockCustomers);
  const [editingCustomer, setEditingCustomer] = useState<number | null>(null);
  const [ismodalOpen, setIsModalOpen] = useState(false);

  const handleAddCustomer = (customer: { name: string; email: string; company: string }) => {
  const newCustomer = {
    id: customers.length + 1,
    ...customer,
    status: "Pending",
  };
  setCustomers([...customers, newCustomer]);
  };
  const handleDeleteCustomer = (id: number) => {    setCustomers(customers.filter((customer) => customer.id !== id));
  };
  const handleEditCustomer = (id: number) => {    setEditingCustomer(id);
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
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Customer
            </button>
          </div>

          <CustomerTable 
              customers={customers} 
              onDeleteCustomer={handleDeleteCustomer} 
              onEditCustomer={handleEditCustomer}
            />

          <div className="mt-6">
            <Modal isOpen={ismodalOpen} onClose={() => setIsModalOpen(false)}>
              <AddCustomerForm onAddCustomer={(customer) => {
                handleAddCustomer(customer);
                setIsModalOpen(false);
              }} />
            </Modal>
          </div>
        </div>  
        
      </div>
    </div>
  );
}