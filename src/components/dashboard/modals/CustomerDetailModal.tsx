import Modal from "@/components/ui/modal";
import { Customer } from "@/types/customer";
import CustomerDetail from "@/components/dashboard/customer-details";
type Notes ={
    id:number
    content:string
    created_at:string
}
type CustomerDetailModalProps ={
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
    notes: Notes[];
    onAddNote:  (...args: any[]) => void;
}

export default function CustomerDetailModal({isOpen,onClose,customer,notes,onAddNote}:CustomerDetailModalProps){
    
        return (
            <Modal isOpen={isOpen} onClose={onClose}>
                {customer ? <CustomerDetail customer={customer} notes={notes} onAddNote={onAddNote} /> : null}
            </Modal>
        )
}