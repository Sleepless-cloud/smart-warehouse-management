import Footer from '@/components/Footer';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { FormattedMessage, history, SelectLang, useIntl, useModel, Helmet } from '@umijs/max';
import { message, Modal } from 'antd';
import Settings from '../../../../config/defaultSettings';
import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { login } from '@/services/api/authentication';
import loginBg from '@/assets/login.avif';
import appLogo from '@/assets/1.png';

const Lang = () => {
  const langClassName = useEmotionCss(({ token }) => {
    return {
      position: 'absolute',
      top: 20,
      right: 20,
    };
  });

  return (
    <div className={langClassName} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const Login: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [initialLoginValues, setInitialLoginValues] = useState<Record<string, any>>({ autoLogin: false });

  useEffect(() => {
    const rememberMe = localStorage.getItem('rememberAutoLogin') === 'true';
    const storedUsername = localStorage.getItem('rememberUsername');
    if (rememberMe && storedUsername) {
      setInitialLoginValues({
        username: storedUsername,
        autoLogin: true,
      });
    } else {
      localStorage.removeItem('rememberUsername');
      localStorage.removeItem('rememberAutoLogin');
    }
  }, []);

  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      overflow: 'hidden',
      backgroundImage: `url(${loginBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
    };
  });

  const frostedBoxClassName = useEmotionCss(({ token }) => {
    return {
      position: 'relative',
      maxWidth: '450px',
      width: '100%',
      padding: '40px 50px 30px 50px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px)',
      webkitBackdropFilter: 'blur(12px)',
      borderRadius: '16px',
      border: `1px solid ${token.colorBorderSecondary}40`,
      boxShadow: `0 8px 32px 0 rgba(31, 38, 135, 0.15)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    };
  });

  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentToken: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const msg = await login({ userId: values.username!, password: values.password! });
      if (!msg) return;

      if (values.autoLogin) {
        localStorage.setItem('rememberUsername', values.username);
        localStorage.setItem('rememberAutoLogin', 'true');
      } else {
        localStorage.removeItem('rememberUsername');
        localStorage.removeItem('rememberAutoLogin');
      }

      const defaultLoginSuccessMessage = intl.formatMessage({
        id: 'pages.login.success',
        defaultMessage: '登录成功！',
      });
      message.success(defaultLoginSuccessMessage);
      await fetchUserInfo();
      const urlParams = new URL(window.location.href).searchParams;
      history.push(urlParams.get('redirect') || '/');
      return;
    } catch (error: any) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      message.error(error?.message || defaultLoginFailureMessage);
    }
  };

  const showForgotPasswordModal = () => {
    Modal.info({
      title: '忘记密码',
      content: (
        <div>
          <p>忘记密码功能需要后端支持才能实现密码重置流程。</p>
          <p>请联系系统管理员协助您找回密码。</p>
        </div>
      ),
      onOk() {},
    });
  };

  return (
    <div className={containerClassName}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录',
          })}
          - 比特云仓
        </title>
      </Helmet>
      <div className={frostedBoxClassName}>
        <Lang />
        <img
          alt="logo"
          src={appLogo}
          style={{
            height: '60px',
            width: 'auto',
            objectFit: 'contain',
            marginBottom: '30px',
          }}
        />
        <LoginForm
          key={JSON.stringify(initialLoginValues)}
          style={{ width: '100%' }}
          contentStyle={{
            backgroundColor: 'transparent',
            boxShadow: 'none',
            padding: 0,
          }}
          initialValues={initialLoginValues}
          onFinish={async (values) => {
            await handleSubmit(values);
          }}
        >
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
            }}
            placeholder="请输入用户名"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.username.required"
                    defaultMessage="请输入用户名!"
                  />
                ),
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder="请输入密码"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.password.required"
                    defaultMessage="请输入密码！"
                  />
                ),
              },
            ]}
          />

        </LoginForm>
        <Footer />
      </div>
    </div>
  );
};

export default Login;
