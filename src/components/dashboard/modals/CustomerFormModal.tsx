import Modal from "@/components/ui/modal";
import AddCustomerForm from "@/components/dashboard/add-customer-form";
import { Customer } from "@/types/customer";

type CustomerFormModalProps = {
    isOpen: boolean;
    customer : Customer | null; 
    onClose: () => void;
    onSave: (...args: any[]) => void;
}
export default function CustomerFormModal({isOpen,customer,onClose,onSave}:CustomerFormModalProps){

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <AddCustomerForm customer={customer} onSave={onSave} />
        </Modal>
    )
}