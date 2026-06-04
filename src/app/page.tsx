"use client";

import { useState } from "react";
import { useEffect } from "react";
import {
  getCustomers,
  addCustomer,
  deleteCustomer,
  editCustomer,
} from "@/lib/services/customer-service";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import StatsCard from "@/components/dashboard/stats-card";
import CustomerTable from "@/components/dashboard/customer-table";
import AddCustomerForm from "@/components/dashboard/add-customer-form";
import Modal from "@/components/ui/modal";
import { Customer } from "@/types/customer";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../lib/services/auth-service";
import { getNotes, createNote } from "../lib/services/note-service";
import CustomerDetail from "@/components/dashboard/customer-details";

export default function Home() {
  const [customers, setCustomers] = useState<
    {
      id: number;
      name: string;
      email: string;
      company: string;
      status: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
    email: string;
    company: string;
    status: string;
  } | null>(null);
  const [customerNotes, setCustomerNotes] = useState([]);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const user = await getCurrentUser();
    if (!user) {
      router.push("/login");
    } else {
      loadCustomers();
    }
  }

  async function loadCustomers() {
    try {
      const data = await getCustomers();
      setCustomers(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load customers:", error);
    }
  }

  const handleAddCustomer = async (customer: {
    name: string;
    email: string;
    company: string;
    status: string;
  }) => {
    const newCustomer = {
      id: customers.length + 1,
      ...customer,
    };
    const result = await addCustomer(customer);
    if (result.success) {
      alert("Customer added successfully");
    } else {
      alert("Failed to add customer");
    }
    setCustomers([...customers, newCustomer]);
  };

  const handleDeleteCustomer = async (id: number) => {
    const result = await deleteCustomer(id);
    if (result.success) {
      alert("Customer deleted successfully");
    } else {
      alert("Failed to delete customer");
    }
    setCustomers(customers.filter((customer) => customer.id !== id));
  };

  const handleOpenEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCustomerFormOpen(true);
  };

  const handleSaveCustomer = async (customer: {
    name: string;
    email: string;
    company: string;
    status: string;
  }) => {
    if (selectedCustomer) {
      const updatedCustomer = { ...selectedCustomer, ...customer };
      const { id, ...updates } = updatedCustomer;
      const result = await editCustomer(id, updates);
      if (result.success) {
        alert("Customer updated successfully");
      } else {
        alert("Failed to update customer");
      }
      setCustomers(
        customers.map((c) =>
          c.id === updatedCustomer.id ? updatedCustomer : c,
        ),
      );
      setSelectedCustomer(null);
    } else {
      await handleAddCustomer(customer);
    }
    setIsCustomerFormOpen(false);
  };

  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    const response = await getNotes(customer.id);
    setCustomerNotes(response.notes);
    setIsDetailsModalOpen(true);
  };
  const handleAddNote = async (customerId: number, note: string) => {
    try {
      await createNote(customerId, note);
      // Refresh the notes after adding a new one
      const response = await getNotes(customerId);
      setCustomerNotes(response.notes);
    } catch (error) {
      console.error("Failed to add note:", error);
    }
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
              onClick={() => setIsCustomerFormOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Customer
            </button>
          </div>

          {isLoading ? (
            <p>Loading customers...</p>
          ) : (
            <CustomerTable
              customers={customers}
              onDeleteCustomer={handleDeleteCustomer}
              onEditCustomer={handleOpenEditModal}
              onViewCustomer={handleViewCustomer}
            />
          )}

          <div className="mt-6">
            <Modal
              isOpen={isCustomerFormOpen}
              onClose={() => {
                setIsCustomerFormOpen(false);
                setSelectedCustomer(null);
              }}
            >
              <AddCustomerForm
                customer={selectedCustomer}
                onSave={handleSaveCustomer}
              />
            </Modal>
          </div>
          <div className="mt-6">
            <Modal
              isOpen={isDetailsModalOpen}
              onClose={() => {
                setIsDetailsModalOpen(false);
                setSelectedCustomer(null);
              }}
            >
              {selectedCustomer && (
                <CustomerDetail
                  customer={selectedCustomer}
                  notes={customerNotes}
                  onAddNote={handleAddNote}
                />
              )}
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}
