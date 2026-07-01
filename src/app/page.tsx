"use client";

import { useState } from "react";
import { useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import StatsCard from "@/components/dashboard/stats-card";
import CustomerTable from "@/components/dashboard/customer-table";

import { Customer } from "@/types/customer";
import { useCustomers } from "@/hooks/useCustomers";
import { useNotes } from "@/hooks/useNotes";
import { useAuth } from "@/hooks/useAuth";
import CustomerFormModal from "@/components/dashboard/modals/CustomerFormModal";
import CustomerDetailModal from "@/components/dashboard/modals/CustomerDetailModal";
import DeleteCustomerModal from "@/components/dashboard/modals/DeleteCustomerModal";

export default function Home() {
  const {
    customers,
    isCustomerLoading,
    loadCustomers,
    addCustomer,
    deleteCustomer,
    updateCustomer,
  } = useCustomers();
  const { customerNotes, loadNotes, addNote } = useNotes();
  const {  isAuthLoading, checkAuth} = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const totalCustomers = customers.length;
  const totalActiveCustomers = customers.filter(
    (customer) => customer.status === "Active",
  ).length;
  const totalPendingCustomers = customers.filter(
    (customer) => customer.status === "Pending",
  ).length;

  useEffect(() => {
    async function initialize(){
      const authenticated = await checkAuth();

      if(authenticated){
        await loadCustomers()
      }
    }
    initialize();
  }, []);

  const handleDeleteClick = async (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!customerToDelete) return;

    await deleteCustomer(customerToDelete.id);

    setCustomerToDelete(null);
    setIsDeleteModalOpen(false);
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
      await updateCustomer(selectedCustomer.id, customer);
      setSelectedCustomer(null);
    } else {
      await addCustomer(customer);
    }

    setIsCustomerFormOpen(false);
  };

  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    await loadNotes(customer.id);
    setIsDetailsModalOpen(true);
  };

  if (isAuthLoading) {
    return <p>Authentication Loading...</p>;
  }

  return (
    <div className="flex bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <StatsCard
              title="Total Customers"
              value={totalCustomers.toString()}
            />
            <StatsCard
              title="Active Customers"
              value={totalActiveCustomers.toString()}
            />
            <StatsCard
              title="Pending Customers"
              value={totalPendingCustomers.toString()}
            />
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">Customers</h2>

              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>

            <button
              onClick={() => setIsCustomerFormOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Add Customer
            </button>
          </div>

          {isCustomerLoading ? (
            <p>Loading customers...</p>
          ) : (
            <CustomerTable
              customers={filteredCustomers}
              onDeleteCustomer={handleDeleteClick}
              onEditCustomer={handleOpenEditModal}
              onViewCustomer={handleViewCustomer}
            />
          )}

            <CustomerFormModal
              isOpen={isCustomerFormOpen}
              customer={selectedCustomer}
              onClose={() => {
                setIsCustomerFormOpen(false);
                setSelectedCustomer(null);
              }}
              onSave={handleSaveCustomer}
            />
              <CustomerDetailModal
                isOpen={isDetailsModalOpen}
                onClose={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedCustomer(null);
                }}
                customer={selectedCustomer}
                notes={customerNotes}
                onAddNote={addNote}
              />
          
            <DeleteCustomerModal
              isOpen= {isDeleteModalOpen}
               onClose={() => {
                setIsDeleteModalOpen(false);
                setCustomerToDelete(null);
              }}
              onDelete={confirmDelete}
              customerName={customerToDelete}
            />
        </div>
      </div>
    </div>
  );
}
