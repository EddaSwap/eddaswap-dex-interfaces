import React from 'react';

const Backdrop = (props) => (
    props.show ? 
        <div className={"backdrop"} 
        onClick={props.closeModal}></div> 
    : null
)

export default Backdrop