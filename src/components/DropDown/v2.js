import React from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 60,
  },
  '&.MuiSelect-root': {
    paddingLeft: 10,
    paddingRight: 10,
  },
  '&.MuiSelect-icon': {
    marginRight: 10,
  },
}));

function Dropdown({
  defaultValue = 'place',
  value,
  placeholder = '',
  options = [],
  onChange,
  className,
  itemClassName,
  ...rest
}) {
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl}>
      <Select
        labelId='dropdown'
        id='dropdown'
        defaultValue={defaultValue}
        displayEmpty
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        inputProps={{
          'aria-label': 'Without label',
        }}
        {...rest}
        classes={{
          root: itemClassName,
        }}
      >
        <MenuItem value='place' disabled>
          <Typography className={itemClassName}>{placeholder}</Typography>
        </MenuItem>
        {options &&
          options.map((item, index) => {
            return (
              <MenuItem
                key={index}
                value={item.value}
                className={itemClassName}
              >
                <span className='text-gray' style={{ fontSize: 20 }}>
                  {item.label}
                </span>
              </MenuItem>
            );
          })}
      </Select>
    </FormControl>
  );
}

export default Dropdown;
