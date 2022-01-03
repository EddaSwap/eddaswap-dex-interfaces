import { changeLanguage } from 'actions/app/language';
import Dropdown from 'components/DropDown/v2';
import { allLanguages } from 'constants/languages';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IoLanguage } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  icon: {
    marginLeft: 24,
    marginRight: 8,
    color: '#777e90',
  },
}));

const LanguageDropdown = () => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const { language } = useSelector((state) => state.app.storage);
  const { i18n } = useTranslation();
  const languagesList = Object.values(allLanguages);

  useEffect(() => {
    i18n && i18n.changeLanguage && i18n.changeLanguage(language);
  }, [language]);

  const onChangeLanguage = (e) => {
    dispatch(changeLanguage(e.target.value));
    e.stopPropagation();
  };

  return (
    <div className='select-language-container flex justify-center'>
      <IoLanguage size={30} className={classes.icon} />
      <Dropdown
        options={languagesList.map((lang, index) => {
          return {
            key: index,
            id: lang?.code,
            value: lang?.code,
            label: (lang?.code).toUpperCase(),
            children: <p>{lang?.language}</p>,
          };
        })}
        value={language}
        onChange={(item) => onChangeLanguage(item)}
      ></Dropdown>
    </div>
  );
};

export default LanguageDropdown;
