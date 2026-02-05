import { useTranslation } from 'react-i18next';
import {  Dropdown } from 'antd';
import { useEffect, useState } from 'react';
import { setLanguage } from '@/store/common/slice';
import { useAppDispatch } from '@/store/hooks';
import { TranslationOutlined } from '@ant-design/icons';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const [selectedLang, setSelectedLang] = useState(i18n.language);

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
    dispatch(setLanguage(lng));
    setSelectedLang(lng);
  };

  useEffect(() => {
    dispatch(setLanguage(i18n.language));
    setSelectedLang(i18n.language);
  }, [i18n.language, dispatch]);

  const languageItems = [
    { key: 'en', label: 'English' },
    { key: 'vi', label: 'Tiếng Việt' },
  ];

  return (
    <Dropdown
      menu={{
        items: languageItems.map(item => ({
          key: item.key,
          label: (
            <span
              style={{
                fontWeight: selectedLang === item.key ? 'bold' : 'normal',
                color: selectedLang === item.key ? 'black' : 'inherit',
              }}
              onClick={() => changeLanguage(item.key)}
            >
              {item.label}
            </span>
          ),
        })),
      }}
      trigger={['click']}
      placement="bottomLeft"
    >
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <TranslationOutlined />
      </span>
    </Dropdown>
  );
};

export default LanguageSwitcher;
