import React from 'react';

const Card = (props) => {
    const {
        title,
        body,
        action,
        className
    } = props;
    return (
        <div className={`${className} card`}>
            {title && <h5 className="header">{title}</h5>}
            {body || props.children}
            {action}
        </div>
    )
}

export default Card;