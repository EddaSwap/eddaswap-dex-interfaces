import React from "react";
import { useTranslation } from "react-i18next";

function Button({
  label = "",
  theme = "primary",
  onClick = () => {},
  loading,
  text = false,
  round = true,
  className = "",
  disabled,
  children,
  ...rest
}) {
  const { t } = useTranslation();

  let buttonClassName = `btn-${theme} ${text && "btn-text"} ${
    round && "roundButton"
  } ${className}  `;

  return (
    <>
      {disabled ? (
        <div
          className={
            disabled ? `${buttonClassName} disabled` : { buttonClassName }
          }
        >
          {loading ? (
            <div className="flex">
              <p style={{ marginRight: "10px", marginBottom: "0px" }}>
                {t("component.button.processing")}
              </p>
              <div className="loader"></div>
            </div>
          ) : (
            label || children
          )}
        </div>
      ) : (
        <div className={buttonClassName} onClick={onClick}>
          {loading ? <div className="loader"></div> : label || children}
        </div>
      )}
    </>
  );
}

export default Button;
