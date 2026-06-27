"use client";

import { useState } from "react";
import { useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import StatsCard from "@/components/dashboard/stats-card";
import CustomerTable from "@/components/dashboard/customer-table";
import AddCustomerForm from "@/components/dashboard/add-customer-form";
import Modal from "@/components/ui/modal";
import { Customer } from "@/types/customer";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../lib/services/auth-service";
import CustomerDetail from "@/components/dashboard/customer-details";
import { useCustomers } from "@/hooks/useCustomers";
import { useNotes } from "@/hooks/useNotes";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
    email: string;
    company: string;
    status: string;
  } | null>(null);
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

  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const user = await getCurrentUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      await loadCustomers();
    } finally {
      setIsAuthLoading(false);
    }
  }

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
                  onAddNote={addNote}
                />
              )}
            </Modal>
          </div>
          <div className="mt-6">
            <Modal
              isOpen={isDeleteModalOpen}
              onClose={() => {
                setIsDeleteModalOpen(false);
                setCustomerToDelete(null);
              }}
            >
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Delete Customer</h2>

                <p className="text-gray-600">
                  Are you sure you want to delete
                  <span className="font-semibold">
                    {" "}
                    {customerToDelete?.name}
                  </span>
                  ?
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setCustomerToDelete(null);
                    }}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}
