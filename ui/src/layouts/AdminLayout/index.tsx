import { Outlet, useNavigate } from 'react-router-dom';
import {
  AimOutlined,
  HomeOutlined, InfoCircleFilled,
  InfoCircleOutlined, LogoutOutlined, QuestionCircleFilled,ThunderboltOutlined
} from '@ant-design/icons';
import { ProLayout, ProSettings } from '@ant-design/pro-layout';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'antd';
import { useState } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NetworkStatus from '@/components/NetworkStatus';
import { useAppDispatch } from '@/store/hooks';
import { logOut } from '@/store/auth/slice';

const AdminLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [settings] = useState<Partial<ProSettings> | undefined>({
    fixSiderbar: true,
    layout: 'mix',
  });

  const handleLogout = () => {
    dispatch(logOut());
    navigate('/login');
  };

  return (
    <ProLayout
      appList={[
        {
          icon: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
          title: 'Ant Design',
          desc: 'Ant Design',
          url: 'https://ant.design',
        },
        {
          icon: 'https://gw.alipayobjects.com/zos/antfincdn/FLrTNDvlna/antv.png',
          title: 'AntV',
          desc: 'AntV',
          url: 'https://antv.vision/',
          target: '_blank',
        },
      ]}
      title={t('welcome')}
      logo="https://avatars.githubusercontent.com/u/8186664?s=200&v=4"
      route={{
        routes: [
          {
            path: '/',
            name: t('Dashboard'),
            icon: <HomeOutlined />,
          },
          {
            path: '/system/accounts',
            name: t('Account Management'),
            icon: <InfoCircleOutlined />,
          },
          {
            path: '/ev_charger',
            name: t('EV Charger Management'),
            icon: <ThunderboltOutlined />,
          },
          {
            path: '/map',
            name: t('Map'),
            icon: <AimOutlined />,
          },
        ],
      }}
      token={{
        header: {
          colorBgMenuItemSelected: 'rgba(0,0,0,0.04)',
        },
      }}
      siderMenuType="group"
      menu={{
        collapsedShowGroupTitle: true,
      }}
      avatarProps={{
        src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
        size: 'small',
        title: 'My profile',
        render: (_props, dom) => {
          return (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: t('Log out'),
                    onClick: handleLogout
                  },
                ],
              }}
            >
              {dom}
            </Dropdown>
          );
        },
      }}
      actionsRender={(props) => {
        if (props.isMobile) return [];
        if (typeof window === 'undefined') return [];
        return [

          <InfoCircleFilled key="InfoCircleFilled" />,
          <QuestionCircleFilled key="QuestionCircleFilled" />,
          <LanguageSwitcher />,
          <NetworkStatus />,
        ];
      }}
      headerTitleRender={(logo, title, _) => {
        const defaultDom = (
          <a>
            {logo}
            {title}
          </a>
        );
        if (typeof window === 'undefined') return defaultDom;
        if (document.body.clientWidth < 1400) {
          return defaultDom;
        }
        if (_.isMobile) return defaultDom;
        return (
          <>
            {defaultDom}
          </>
        );
      }}
      menuFooterRender={(props) => {
        if (props?.collapsed) return undefined;
        return (
          <div
            style={{
              textAlign: 'center',
              paddingBlockStart: 12,
            }}
          >
            <div>© 2024 V0.0.1</div>
            <div>by xBase</div>
          </div>
        );
      }}
      onMenuHeaderClick={(e) => console.log(e)}
      menuItemRender={(item, dom) => (
        <a onClick={() => navigate(item.path || '/')}>{dom}</a>
      )}
      {...settings}
    >
      <Outlet />
    </ProLayout>
  );
};

export default AdminLayout;
