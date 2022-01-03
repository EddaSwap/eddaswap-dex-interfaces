import React, { useState, useEffect } from 'react';
import { getIcon } from 'lib/imageHelper';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';

function Collapsible(props) {
  const { title, IconComponent, children } = props;
  const [open, setOpen] = useState(false);

  const togglePanel = (e) => {
    setOpen(!open);
  };

  return (
    <div className='collapsible'>
      <div
        onClick={(e) => togglePanel(e)}
        className='collapsible-header pointer'
      >
        {title}
        {IconComponent ? (
          IconComponent
        ) : open ? (
          <BsChevronUp className='icons' />
        ) : (
          <BsChevronDown className='icons' />
        )}
      </div>
      {open ? <div className='collapsible-content'>{children}</div> : null}
    </div>
  );
}

export default Collapsible;
