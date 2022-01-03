import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function TextInput(props) {
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const {
    placeholder = '',
    containerClassname = '',
    className = '',
    onChange = () => {},
  } = props;

  const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group

  const enforcer = (nextUserInput) => {
    try {
      if (
        (props.type === 'number' && nextUserInput === '') ||
        inputRegex.test(escapeRegExp(nextUserInput))
      ) {
        onChange(nextUserInput);
      }
      if (props.type !== 'number') {
        onChange(nextUserInput);
      }
      {
        (props.max || props.max === 0) && parseFloat(nextUserInput) > props.max
          ? setError(t('component.textInput.invalidAmount'))
          : setError('');
      }
    } catch {}
  };

  return (
    <div className={`text-input-container ${containerClassname}`}>
      <input
        id={props.id}
        className={`text-input ${className}`}
        value={props.value}
        onChange={(e) => enforcer(e.target.value.replace(/,/g, '.'))}
        disabled={props.disabled}
        autoComplete='off'
        placeholder={placeholder}
        pattern='^[0-9]*[.,]?[0-9]*$'
      />
      <span className='text-error'>{error}</span>
    </div>
  );
}

export default TextInput;
