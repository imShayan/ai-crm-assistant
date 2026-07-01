import Modal from "@/components/ui/modal";
import { Customer } from "@/types/customer";
type DeleteCustomerModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    customerName: Customer | null;
}
export default function DeleteCustomerModal({ isOpen, onClose, onDelete, customerName }: DeleteCustomerModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Delete Customer</h2>

                <p className="text-gray-600">
                  Are you sure you want to delete
                  <span className="font-semibold">
                    {" "}
                    {customerName?.name}
                  </span>
                  ?
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={onDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
        </Modal>
    )
}