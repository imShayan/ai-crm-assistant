type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="
        relative
        bg-white
        rounded-xl
        shadow-xl
        w-full
        max-w-5xl
        max-h-[90vh]
        overflow-y-auto
        p-6
      "
      >
        <button
          className="
          absolute
          top-4
          right-4
          text-gray-500
          hover:text-gray-800
          text-xl
          font-bold
        "
          onClick={onClose}
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
}
