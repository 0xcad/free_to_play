import { useRef, useState, useEffect } from "react";
import './modal.css';

interface ModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({
  isOpen, onClose, children
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(isOpen ? isOpen : false);
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement) return;

    if (onClose && isOpen || !onClose && modalIsOpen) {
      modalElement.showModal();
    } else if (onClose && !isOpen || !onClose && !modalIsOpen) {
      modalElement.close();
    }
}, [isOpen, modalIsOpen]);

  const handleCloseModal = () => {
    if (onClose) {
      onClose();
    } else {
      setModalIsOpen(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "Escape") {
      handleCloseModal();
    }
  };

  return (
    <dialog ref={modalRef} className="modal" onKeyDown={handleKeyDown}>
      <button className="modal-close-btn" onClick={handleCloseModal}>
        Close
      </button>
      {children}
    </dialog>
  );
}

export default Modal;
