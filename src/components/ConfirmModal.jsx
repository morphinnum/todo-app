import Portal from './Portal';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Portal isOpen={isOpen}>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Confirm
        </button>
      </div>
    </Portal>
  );
}