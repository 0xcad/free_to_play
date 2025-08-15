import { useRef, useState, useEffect } from "react";
import './modal.css';

import { motion, AnimatePresence } from "motion/react"

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
      //modalElement.close();
      setTimeout(() => modalElement.close(), 220);
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
      <AnimatePresence>
      {isOpen && (
      <motion.div
        className='modal flex-column'
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.8, opacity: 0, y: -50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", bounce: 0.6 }}
      >
        <div className='modal-header shade'>
          <h2 className="modal-title">{title ? (<>{title}</>) : "Free to Play"}</h2>

          <button className="modal-close-btn button w-auto flex-center font-alt" onClick={handleCloseModal}>
            &#10006;
          </button>
        </div>
        <div className='modal-content'>
          {children}
        </div>
        <div className='p-3 modal-footer flex-center'>
          <button className="button" onClick={handleCloseModal}>
            Close
          </button>
        </div>
      </motion.div>
      )}
      </AnimatePresence>
    </dialog>
  );
}

export default Modal;
