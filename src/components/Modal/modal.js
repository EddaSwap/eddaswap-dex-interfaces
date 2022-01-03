import React from 'react';
import Backdrop from './backdrop';
import { closeModal } from 'actions/app/modal';
import { AiOutlineClose } from 'react-icons/ai';
import { useSelector, useDispatch } from 'react-redux';

function Modal() {
  const { modalToggle, body, className } = useSelector(
    (state) => state.app.modal
  );
  const dispatch = useDispatch();

  const showClassName = !modalToggle ? 'close' : null;

  const onCloseModal = () => {
    dispatch(closeModal());
  };

  return (
    <div className={`custom-modal ${showClassName} ${className}`}>
      <Backdrop show={modalToggle} closeModal={onCloseModal} />
      <div className='content'>
        <div className='header'>
          <AiOutlineClose className='icons close-icon' onClick={onCloseModal} />
        </div>
        {body}
      </div>
    </div>
  );
}

export default Modal;
