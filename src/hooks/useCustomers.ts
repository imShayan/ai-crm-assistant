import { useState } from "react";
import {
  getCustomers as getCustomerService,
  addCustomer as addCustomerService,
  deleteCustomer as deleteCustomerService,
  editCustomer as editCustomerService,
} from "@/lib/services/customer-service";

export function useCustomers() {
  //state
  const [customers, setCustomers] = useState<
    {
      id: number;
      name: string;
      email: string;
      company: string;
      status: string;
    }[]
  >([]);
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
    const newCustomer = {
      id: customers.length + 1,
      ...customer,
    };
    const result = await addCustomerService(customer);
    if (result.success) {
      alert("Customer added successfully");
    } else {
      alert("Failed to add customer");
    }
    setCustomers([...customers, newCustomer]);
  };

  const deleteCustomer = async (id: number) => {
    const result = await deleteCustomerService(id);
    if (result.success) {
      alert("Customer deleted successfully");
    } else {
      alert("Failed to delete customer");
    }
    setCustomers(customers.filter((customer) => customer.id !== id));
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
    const result = await editCustomerService(id, updates);

    if (result.success) {
      alert("Customer updated successfully");

      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer.id === id ? { ...customer, ...updates } : customer,
        ),
      );
    } else {
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
