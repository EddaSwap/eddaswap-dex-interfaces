import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: '0 auto',
    marginBottom: '2rem',
    width: '50%',
    '& > * + *': {
      marginTop: theme.spacing(1),
    },
  },
  paperRoot: {
    borderRadius: 10,
  },
  alertMessage: {
    wordBreak: 'keep-all',
  },
  icon: {
    color: 'red !important',
  },
}));

export default function VersionAlert() {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <div className={classes.root}>
      <Alert
        severity='warning'
        classes={{
          root: classes.paperRoot,
          message: classes.alertMessage,
          icon: classes.icon,
        }}
      >
        {t('migration.alert')}
      </Alert>
    </div>
  );
}
