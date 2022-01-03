import React from "react";
import Button from "components/Button/v2";
import Grid from "@material-ui/core/Grid";
import { useStyles } from "./style";

const LG_GRID = {
  4: 3,
  5: 2,
}; //grid based on items.length
const XS_GRID = {
  4: 6,
  5: 6,
};

function PercentSelection({ items, onChange, unit }) {
  const defaultItems = ["25", "50", "75", "100"];

  const percents = items || defaultItems;

  const classes = useStyles();

  const lg = LG_GRID[percents?.length];
  const xs = XS_GRID[percents?.length];

  return (
    <Grid container justify="center">
      {percents.map((item, index) => {
        return (
          <Grid
            item
            xs={xs}
            lg={lg}
            className={classes.buttonContainer}
            key={index}
          >
            <Button value={item} onClick={onChange} variant="text">
              {item}
              {unit}
            </Button>
          </Grid>
        );
      })}
    </Grid>
  );
}

export default PercentSelection;
