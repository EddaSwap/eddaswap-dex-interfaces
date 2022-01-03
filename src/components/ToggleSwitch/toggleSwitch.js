import React from "react";

const Switch = (props) => {
  return (
    <>
      <input
        className="switch-checkbox"
        checked={props.checked}
        onChange={props.onChange}
        id="switch-new"
        type="checkbox"
      />
      <label
        className={`switch-label ${props.checked && "checked"}`}
        htmlFor={`switch-new`}
      >
        <span className={`switch-button`} />
      </label>
    </>
  );
};

export default Switch;
