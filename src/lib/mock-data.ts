import { Customer } from '../types/customer';

export const mockCustomers: Customer[] = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        company: 'Acme Corp',
        status: 'Active',

    },
    {
        id: 2,
        name: 'Sarah Smith',
        email: 'sarah@example.com',
        company: 'Microsoft',
        status: 'Pending',
    },
    {
        id: 3,
        name: 'Michael Lee',
        email: 'michael@example.com',
        company: 'Amazon',
        status: 'Active',
    },
];