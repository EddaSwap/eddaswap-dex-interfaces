import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: 20,
    marginBottom: 20,
    width: '100%',
    padding: 20,
  },
  header: {},
  desc: {
    marginTop: 8,
    color: '#777e90',
  },
}));

function MigrateCard({ title, description, children, ...rest }) {
  const classes = useStyles();

  return (
    <div className='migrate'>
      <Card className='card'>
        <Box className={classes.header}>
          <Typography variant='h6'>{title}</Typography>
          <p className={`text-gray ${classes.desc}`}>{description}</p>
        </Box>
        <br />
        <hr style={{ margin: 0, borderTop: '1px solid #e6e8ec' }} />
        <br />
        {children}
      </Card>
    </div>
  );
}

export default MigrateCard;
