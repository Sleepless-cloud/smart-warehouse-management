import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Card, theme, Row, Col, Button, List, Avatar, message } from 'antd';
import { history } from '@umijs/max';
import React, { useEffect, useState } from 'react';
import {
  DashboardOutlined,
  BoxPlotOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  SecurityScanOutlined,
  BarChartOutlined,
  CloudOutlined,
} from '@ant-design/icons';
import axios from 'axios';

/**
 * 每个单独的卡片，为了复用样式抽成了组件
 * @param param0
 * @returns
 */
const InfoCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  desc: string;
  color: string;
  link: string;
}> = ({ title, icon, desc, color, link }) => {
  const { useToken } = theme;
  const { token } = useToken();

  const handleClick = () => {
    history.push(link);
  };

  return (
    <div
      style={{
        backgroundColor: token.colorBgContainer,
        boxShadow: token.boxShadow,
        borderRadius: '8px',
        fontSize: '14px',
        color: token.colorTextSecondary,
        lineHeight: '22px',
        padding: '24px',
        height: '100%',
        transition: 'all 0.3s',
        cursor: 'pointer',
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        const target = e.currentTarget;
        target.style.transform = 'translateY(-5px)';
        target.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        target.style.transform = 'none';
        target.style.boxShadow = token.boxShadow;
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            fontSize: '24px',
            color: color,
            marginRight: '12px',
          }}
        >
          {icon}
        </div>
        <div
          style={{
            fontSize: '18px',
            color: token.colorText,
            fontWeight: 'bold',
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: '14px',
          color: token.colorTextSecondary,
          lineHeight: '24px',
        }}
      >
        {desc}
      </div>
    </div>
  );
};

// 天气信息接口
interface WeatherInfo {
  city?: string;
  weather?: string;
  temperature?: string;
  reportTime?: string;
}

// Data for System Highlights List
const highlightsData = [
  {
    id: 1,
    title: '精准库存控制',
    description: '实时跟踪库存数量与状态，支持先进先出、批次管理，减少错误与损耗。',
    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  },
  {
    id: 2,
    title: '数据安全保障',
    description: '多级权限管理与操作日志记录，确保仓库数据的安全与可追溯性。',
    icon: <SecurityScanOutlined style={{ color: '#faad14' }} />,
  },
  {
    id: 3,
    title: '智能报表分析',
    description: '提供多维度的数据报表，帮助您分析仓储效率，优化运营决策。',
    icon: <BarChartOutlined style={{ color: '#1890ff' }} />,
  },
];

// 根据当前时间获取问候语
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) {
    return '早上好';
  } else if (hour >= 11 && hour < 14) {
    return '中午好';
  } else if (hour >= 14 && hour < 18) {
    return '下午好';
  } else {
    return '晚上好';
  }
};

const Welcome: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  const [greeting, setGreeting] = useState<string>('');
  const { currentToken } = initialState || {};
  const userName = currentToken?.userName || '用户';
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo>({});
  const [loading, setLoading] = useState<boolean>(false);

  // 在组件加载时获取问候语
  useEffect(() => {
    setGreeting(getGreeting());
    // 每分钟更新一次问候语，以防用户长时间停留在页面
    const intervalId = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    
    // 获取天气信息
    fetchWeather();
    
    return () => clearInterval(intervalId);
  }, []);

  // 获取天气信息
  const fetchWeather = async () => {
    setLoading(true);
    try {
      // 默认使用北京市的城市编码，实际应用中可以根据用户位置动态获取
      const cityCode = '370215';
      const response = await axios.get(
        `https://restapi.amap.com/v3/weather/weatherInfo?city=${cityCode}&key=812603d9ad64412b5c311d6a952676ef`,
      );
      
      if (response.data.status === '1' && response.data.lives && response.data.lives.length > 0) {
        const liveData = response.data.lives[0];
        setWeatherInfo({
          city: liveData.city,
          weather: liveData.weather,
          temperature: liveData.temperature,
          reportTime: liveData.reporttime,
        });
      } else {
        message.error('获取天气信息失败');
      }
    } catch (error) {
      console.error('获取天气信息出错:', error);
      message.error('获取天气信息出错');
    } finally {
      setLoading(false);
    }
  };

  const goToHelp = () => {
    history.push('/help');
  };

  return (
    <PageContainer>
      <Card
        style={{
          borderRadius: 8,
          marginBottom: 24,
        }}
        bodyStyle={{
          backgroundImage:
            initialState?.settings?.navTheme === 'realDark'
              ? 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
              : 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
        }}
      >
        <div style={{ padding: '24px 0' }}>
          <div
            style={{
              fontSize: '28px',
              color: token.colorTextHeading,
              fontWeight: 'bold',
              textAlign: 'center',
              width: '100%',
              marginBottom: '16px',
            }}
          >
            {greeting}，{userName}。欢迎来到比特云仓
            {weatherInfo.city && (
              <div style={{ fontSize: '16px', fontWeight: 'normal', marginTop: '8px' }}>
                <CloudOutlined style={{ marginRight: '8px' }} />
                {weatherInfo.city} {weatherInfo.weather} {weatherInfo.temperature}°C
              </div>
            )}
          </div>
          <p
            style={{
              fontSize: '16px',
              color: token.colorTextSecondary,
              lineHeight: '26px',
              marginBottom: '16px',
              textAlign: 'left',
              paddingLeft: '0',
            }}
          >
            比特云仓是一套现代化的仓库管理系统，致力于提供高效、智能的仓储解决方案。通过数字化管理，实现库存精准控制，提升仓储运营效率。比特云仓，开启云端存储新想象。
          </p>
          
          <div style={{ marginBottom: '24px' }}>
            <Button 
              type="link" 
              onClick={goToHelp}
              style={{ fontSize: '16px', paddingLeft: '0' }}
            >
              第一次使用？点此查看帮助文档，轻松上手！
            </Button>
          </div>
          
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <InfoCard
                icon={<DashboardOutlined />}
                color="#1890ff"
                title="数据看板"
                desc="查看系统概览、关键指标和最新动态。"
                link="/dashboard"
              />
            </Col>
            <Col xs={24} sm={8}>
              <InfoCard
                icon={<BoxPlotOutlined />}
                color="#52c41a"
                title="物品管理"
                desc="管理仓库中的所有物品信息，包括添加、编辑和删除。"
                link="/warehouse/item"
              />
            </Col>
            <Col xs={24} sm={8}>
              <InfoCard
                icon={<SyncOutlined />}
                color="#722ed1"
                title="仓库动态"
                desc="查看物品的出入库记录和实时流水。"
                link="/warehouse/transaction"
              />
            </Col>
          </Row>

          <Card title="系统亮点" style={{ borderRadius: 8 }}>
            <List
              itemLayout="horizontal"
              dataSource={highlightsData}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={<Avatar size="large" icon={item.icon} style={{ backgroundColor: 'transparent' }}/>}
                    title={<span style={{ fontWeight: 500 }}>{item.title}</span>}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Welcome;
