import { useState } from "react";
import type { Customer } from "@/types/customer";
import {
  getCustomers as getCustomerService,
  addCustomer as addCustomerService,
  deleteCustomer as deleteCustomerService,
  editCustomer as editCustomerService,
} from "@/lib/services/customer-service";

export function useCustomers() {
  //state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isCustomerLoading, setIsCustomerLoading] = useState(true);

  async function loadCustomers() {
    try {
      const data = await getCustomerService();
      setCustomers(data);
      setIsCustomerLoading(false);
    } catch (error) {
      console.error("Failed to load customers:", error);
    }
  }
  const addCustomer = async (customer: {
    name: string;
    email: string;
    company: string;
    status: string;
  }) => {
    try {
      const result = await addCustomerService(customer);
      const savedCustomer = result.customer;
      if (result.success && savedCustomer) {
        alert("Customer added successfully");
        setCustomers((currentCustomers) => [...currentCustomers, savedCustomer]);
      } else {
        alert("Failed to add customer");
      }
    } catch (error) {
      console.error("Failed to add customer:", error);
      alert("Failed to add customer");
    }
  };

  const deleteCustomer = async (id: number) => {
    try {
      const result = await deleteCustomerService(id);
      if (result.success) {
        alert("Customer deleted successfully");
        setCustomers((currentCustomers) =>
          currentCustomers.filter((customer) => customer.id !== id),
        );
      } else {
        alert("Failed to delete customer");
      }
    } catch (error) {
      console.error("Failed to delete customer:", error);
      alert("Failed to delete customer");
    }
  };
  const updateCustomer = async (
    id: number,
    updates: {
      name: string;
      email: string;
      company: string;
      status: string;
    },
  ) => {
    try {
      const result = await editCustomerService(id, updates);
      const savedCustomer = result.customer;

      if (result.success && savedCustomer) {
        alert("Customer updated successfully");

        setCustomers((prevCustomers) =>
          prevCustomers.map((customer) =>
            customer.id === id ? savedCustomer : customer,
          ),
        );
      } else {
        alert("Failed to update customer");
      }
    } catch (error) {
      console.error("Failed to update customer:", error);
      alert("Failed to update customer");
    }
  };

  //function
  return {
    customers,
    isCustomerLoading,
    loadCustomers,
    addCustomer,
    deleteCustomer,
    updateCustomer,
  };
}
