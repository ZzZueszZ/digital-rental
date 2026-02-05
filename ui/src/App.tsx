import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import en_US from 'antd/locale/en_US';
import vi_VN from 'antd/locale/vi_VN';
import ScrollTop from '@/components/ScrollTop';
import router from '@/routes';
import { useAppSelector } from '@/store/hooks';
import { selectLanguage } from '@/store/common/slice';
import i18n from '@/i18n';

function App() {
  const currentLanguage = useAppSelector(selectLanguage);

  return (
    <ConfigProvider theme={{ cssVar: true }} locale={ (currentLanguage || i18n.language) === 'vi' ? vi_VN : en_US }>
      <ScrollTop>
        <RouterProvider router={router} />
      </ScrollTop>
    </ConfigProvider>
  );
}

export default App;
