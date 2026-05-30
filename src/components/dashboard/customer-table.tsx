import { Customer } from '../../types/customer';

type CustomerTableProps = {
  customers: Customer[];
  onDeleteCustomer?: (id: number) => void;
  onEditCustomer?: (id: number) => void;
};

export default function CustomerTable({ customers, onDeleteCustomer, onEditCustomer }: CustomerTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            {onDeleteCustomer && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="px-6 py-4 whitespace-nowrap">{customer.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{customer.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">{customer.company}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {customer.status}
                </span>
              </td>
              {onDeleteCustomer && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onDeleteCustomer(customer.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                  <span className="mx-2">|</span>
                {onEditCustomer && (
                  <button
                    onClick={() => onEditCustomer(customer.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
              )}

                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}