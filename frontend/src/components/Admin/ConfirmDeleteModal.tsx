import { Dialog } from "@headlessui/react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  username,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed z-50 inset-0 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl z-50 shadow-xl text-center w-[90%] max-w-md">
        <Dialog.Title className="text-xl font-bold text-red-600">
          Confirmă ștergerea
        </Dialog.Title>
        <Dialog.Description className="mt-2 text-gray-700 dark:text-gray-300">
          Ești sigur că vrei să ștergi utilizatorul <b>{username}</b>?
        </Dialog.Description>
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Da, șterge
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Anulează
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmDeleteModal;
