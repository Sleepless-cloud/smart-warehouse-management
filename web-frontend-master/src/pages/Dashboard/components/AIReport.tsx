import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Skeleton, message, Result } from 'antd';
import { SyncOutlined, FileTextOutlined } from '@ant-design/icons';
import { getDashboardAIReport } from '@/services/api/dashboard';
import ReactMarkdown from 'react-markdown';
import './AIReport.less';

const { Title, Paragraph, Text } = Typography;

interface AIReportProps {
  className?: string;
  style?: React.CSSProperties;
}

const AIReport: React.FC<AIReportProps> = ({ className, style }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchReport = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await getDashboardAIReport();
      
      // 确保response存在
      if (!response) {
        throw new Error('API返回空响应');
      }
      
      if (response.success && response.content) {
        setReport(response.content);
        setLastUpdated(response.timestamp || Date.now());
        if (showRefreshIndicator) {
          message.success('AI日报已更新');
        }
      } else {
        setError(response.message || '获取AI日报失败');
      }
    } catch (err: any) {
      console.error('获取AI日报失败:', err);
      setError(err.message || '获取AI日报失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleRefresh = () => {
    fetchReport(true);
  };

  // 使用Markdown渲染内容
  const renderMarkdown = () => {
    if (!report) return null;
    
    return (
      <div className="markdownContent">
        <ReactMarkdown>{report}</ReactMarkdown>
      </div>
    );
  };

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <Skeleton active paragraph={{ rows: 10 }} />
      );
    }

    if (error) {
      return (
        <Result
          status="warning"
          title="AI日报生成失败"
          subTitle={error}
          extra={
            <Button type="primary" onClick={() => fetchReport()}>
              重试
            </Button>
          }
        />
      );
    }

    if (!report) {
      return (
        <Result
          status="info"
          title="暂无AI日报数据"
          subTitle="请点击刷新按钮生成今日报告"
          extra={
            <Button type="primary" onClick={() => fetchReport()}>
              立即生成
            </Button>
          }
        />
      );
    }

    return (
      <div className="reportContent">
        {renderMarkdown()}
        {lastUpdated && (
          <div className="updateTime">
            <Text type="secondary">
              最后更新时间: {new Date(lastUpdated).toLocaleString()}
            </Text>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card
      className={className}
      style={style}
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FileTextOutlined style={{ marginRight: 8 }} />
          <span>AI日报</span>
        </div>
      }
      extra={
        <Button
          type="text"
          icon={<SyncOutlined spin={refreshing} />}
          onClick={handleRefresh}
          loading={refreshing}
          disabled={loading && !refreshing}
        >
          刷新
        </Button>
      }
      bodyStyle={{ padding: '12px 24px' }}
    >
      {renderContent()}
    </Card>
  );
};

export default AIReport; 