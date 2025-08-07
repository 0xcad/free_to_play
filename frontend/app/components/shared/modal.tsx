import { useRef, useState, useEffect } from "react";
import './modal.css';

export interface ModalProps {
  title?: string;
  isOpen?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({
  title, isOpen, onClose, children
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
    <dialog ref={modalRef} className="modal-overlay flex-center" onKeyDown={handleKeyDown} onClick={handleCloseModal}>
      {/* Prevent closing modal when clicking inside the modal content */}
      <div class='modal' onClick={(e) => e.stopPropagation()}>
        <div class='modal-header shade'>
          <h2 className="modal-title">{title ? (<>{title}</>) : "Free to Play"}</h2>

          <button className="modal-close-btn button w-auto flex-center" onClick={handleCloseModal}>
            &#10006;
          </button>
        </div>
        <div class='modal-content'>
          {children}
        </div>
        <div className='p-3 modal-footer flex-center'>
          <button className="button" onClick={handleCloseModal}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default Modal;
