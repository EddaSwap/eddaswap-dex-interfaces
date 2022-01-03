import React from "react";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  switchBase: {
    marginTop: 6,
    marginLeft: 8,
  },
  checked: {},
  track: {
    borderRadius: 50,
  },
  root: {
    height: 48,
    width: 70,
  },
  thumb: {
    width: 18,
    height: 18,
  },
  label: {
    textTransform: "uppercase",
  },
}));

export default function SwitchLabels({
  label,
  checked,
  onChange,
  disabled,
  formClasses,
  ...props
}) {
  const classes = useStyles();

  const handleChange = (event) => {
    onChange(event.target.checked, event);
  };

  return (
    <FormControlLabel
      disabled={disabled}
      control={
        <Switch
          checked={checked}
          onChange={handleChange}
          name="checked"
          color="secondary"
          {...props}
          classes={{
            root: classes.root,
            switchBase: classes.switchBase,
            thumb: classes.thumb,
            track: classes.track,
            checked: classes.checked,
          }}
        />
      }
      label={label}
      classes={formClasses}
      // classes={classes}
    />
  );
}
