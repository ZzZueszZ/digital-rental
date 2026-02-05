import {useTranslation} from "react-i18next";
import Alert from "antd/es/alert/Alert";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {LoginForm, ProFormCheckbox, ProFormText} from "@ant-design/pro-components";
import {login} from "@/pages/authentication/login/service";
import {useRequest} from "ahooks";
import {Skeleton} from "antd";
import {LoginParams} from "@/pages/authentication/login/data";
import {useNavigate} from "react-router-dom";
import { setAuthToken } from '@/store/auth/slice';
import { useAppDispatch } from '@/store/hooks';
import styles from "./styles.module.less"
import "./override.module.less"
import LoginTitle from "@/pages/authentication/components/LoginTitle";
import Footer from "@/pages/authentication/components/Footer";
import { useState } from "react";
const LoginPage = () => {
    const {t} = useTranslation();
    // helper to cast translation to string to satisfy JSX/Alert typings
    const tr = (s: string) => (t(s) as unknown) as string;
    const [showError, setShowError] = useState(false);
    // cast translated message to ReactNode to satisfy Alert.message typing
    const incorrectCredMessage = (tr('Incorrect username or password') as unknown) as React.ReactNode;
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {error, loading, runAsync: triggerAction, reset} = useRequest(login, {
        manual: true,
        onBefore: () => {
            // hide previous errors when a new request starts
            setShowError(false);
        },
        onSuccess: (result, params) => {
            console.log('onSuccess', result, params);
            dispatch(setAuthToken(result));
            navigate('/');
        },
        onError: (error) => {
            console.log('onError',error);
            // only show the alert after an actual failed request
            setShowError(true);
        },
    });


    if(loading) return <Skeleton/>

    return (
      <div className={styles.customPageContainer}>

        <div className={styles.customSvgBackground}>
          <img src="/images/backgrounds/antd.svg" alt="Background Logo"/></div>

        <LoginForm
          className={styles.customFormLogin}
          // reset any previous error when user changes inputs
          onValuesChange={() => { setShowError(false); reset && reset(); }}
          onFinish={async (values) => {
            await triggerAction(values as LoginParams);
          }}

          // only show message after a real request error
          message={showError && error &&
            <Alert
              style={{marginBottom: 24}}
              message={incorrectCredMessage}
              type="error"
              showIcon
            />
          }

        >
          <LoginTitle/>
          <div>

            <ProFormText
              name="userName"
              label="Username"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined/>,
                style: {
                  borderRadius: '3px',
                },
              }}

              placeholder={t('your username')}
              rules={[
                {
                  required: true,
                  message: tr("Please input your username!"),
                },
              ]}
            />
          </div>
          <ProFormText.Password
            label="Password"
            name="password"
            fieldProps={{
              size: "large",
              prefix: <LockOutlined/>,
              style: {
                borderRadius: '3px',
              },
            }}
            placeholder={t('your password')}
            rules={[
              {
                required: true,
                message: (tr("Please input your password!")),
              },
            ]}
          />

          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox
              noStyle
            >
              {tr("Remember me")}
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
            >
              {tr("Forget password?")}
            </a>
          </div>
        </LoginForm>
        <Footer/>
      </div>
    );
};

export default LoginPage;
