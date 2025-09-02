import { useEffect, useState, useRef } from 'react';
import { PageContainer, ProCard, StatisticCard, ProTable, ProColumns } from '@ant-design/pro-components';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import Bar2D from '@/components/Bar2D';
import { getDashboardSummary } from '@/services/api/dashboard';
import { Spin, Result, Tag } from 'antd';
import {
  DatabaseOutlined,
  WarningOutlined,
  FieldTimeOutlined,
  AppstoreAddOutlined
} from '@ant-design/icons';
import AIReport from './components/AIReport';

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  LineChart,
  CanvasRenderer,
]);

// --- 从 dashboard.ts 复制类型定义 --- START
declare namespace API {
  // ItemVO 定义
  type ItemVO = {
    id: number;
    name: string;
    itemNumber: string;
    unit: string;
    specification: string;
    stockQuantity?: number;
    threshold: number;
    created_at?: string;
    updated_at?: string;
    operatorName?: string;
    updatedByDesc?: string;
  };

  // DashboardSummaryVO 定义
  type DashboardSummaryVO = {
    totalItemCount?: number;
    totalStockQuantity?: number;
    lowStockItemCount?: number;
    todayTransactionCount?: number;
    topItemsByStock?: { name: string; quantity: number }[];
    recentTransactionTrend?: { date: string; in: number; out: number }[];
    lowStockItems?: ItemVO[];
  };
}
// --- 从 dashboard.ts 复制类型定义 --- END

const { Statistic } = StatisticCard;

// 低库存表格列定义
const lowStockColumns: ProColumns<API.ItemVO>[] = [
  {
    title: '物品编号',
    dataIndex: 'itemNumber',
    width: 120,
    align: 'center',
  },
  {
    title: '物品名称',
    dataIndex: 'name',
    width: 150,
    align: 'center',
  },
  {
    title: '规格',
    dataIndex: 'specification',
    width: 120,
    align: 'center',
  },
  {
    title: '单位',
    dataIndex: 'unit',
    width: 80,
    align: 'center',
  },
  {
    title: '当前库存',
    dataIndex: 'stockQuantity',
    width: 100,
    render: (_, record) => <Tag color="red">{record.stockQuantity}</Tag>,
    align: 'center',
  },
  {
    title: '库存阈值',
    dataIndex: 'threshold',
    width: 100,
    align: 'center',
  },
  // {
  //   title: '最后操作人',
  //   dataIndex: 'handlerName',
  //   width: 100,
  // },
];

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<API.DashboardSummaryVO | null>(null);
  const trendChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getDashboardSummary();
        setData(result || null);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || '获取仪表盘数据失败');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- ECharts Trend Chart Logic --- START ---
  useEffect(() => {
    let chart: echarts.ECharts | null = null;
    let handleResize: (() => void) | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (trendChartRef.current && data?.recentTransactionTrend) {
      // Check if a chart instance already exists and dispose it first
      const existingChart = echarts.getInstanceByDom(trendChartRef.current);
      if (existingChart) {
        existingChart.dispose();
      }

      chart = echarts.init(trendChartRef.current);

      const trendData = data.recentTransactionTrend || [];
      const dates = trendData.map(item => item.date);
      const inData = trendData.map(item => item.in);
      const outData = trendData.map(item => item.out);

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['入库', '出库'],
          top: 'top',
          right: '10%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates
        },
        yAxis: {
          type: 'value',
          min: 0
        },
        series: [
          {
            name: '入库',
            type: 'line',
            smooth: true,
            data: inData,
            itemStyle: { color: '#52c41a' }
          },
          {
            name: '出库',
            type: 'line',
            smooth: true,
            data: outData,
            itemStyle: { color: '#ff4d4f' }
          }
        ]
      };

      chart.setOption(option);

      // Define the resize handler
      handleResize = () => {
          // Ensure chart instance exists before resizing
          if (chart && !chart.isDisposed()) {
              chart.resize();
          }
      };
      window.addEventListener('resize', handleResize);

      // Add a small delay for initial resize
      timer = setTimeout(() => {
          if (chart && !chart.isDisposed()) {
              chart.resize();
          }
      }, 1);
    }

    // Cleanup function
    return () => {
      if (timer !== null) {
         clearTimeout(timer);
      }
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
      // Check if chart exists and is not disposed before disposing
      if (chart && !chart.isDisposed()) {
        chart.dispose();
      }
    };
  }, [data?.recentTransactionTrend]);
  // --- ECharts Trend Chart Logic --- END ---

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Result status="error" title="加载失败" subTitle={error} />
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer>
        <Result status="warning" title="无数据" subTitle="未能获取到仪表盘数据。" />
      </PageContainer>
    );
  }

  // 显式定义 item 类型
  type TrendItem = { date: string; in: number; out: number };

  // 准备 Top 5 柱状图数据
  const topItemsXData = data.topItemsByStock?.map(item => item.name) || [];
  const topItemsYData = data.topItemsByStock?.map(item => item.quantity) || [];

  return (
    <PageContainer>
      {/* 美化后的 Statistic Cards */}
      <ProCard ghost gutter={[16, 16]} wrap style={{ marginBottom: 24 }}>
        <ProCard colSpan={{ xs: 12, sm: 12, md: 6 }} bordered hoverable>
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px' }}>
            <div style={{ marginRight: '16px' }}>
              <div style={{ backgroundColor: '#1890ff', borderRadius: '8px', width: '48px', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <AppstoreAddOutlined style={{ color: 'white', fontSize: 24 }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
              <span style={{ color: '#98a6ad', fontSize: '14px', marginBottom: '4px' }}>物品种类</span>
              <span style={{ color: '#000000', fontSize: '24px', fontWeight: 'bold' }}>{data.totalItemCount ?? '-'}</span>
            </div>
          </div>
        </ProCard>
        <ProCard colSpan={{ xs: 12, sm: 12, md: 6 }} bordered hoverable>
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px' }}>
            <div style={{ marginRight: '16px' }}>
              <div style={{ backgroundColor: '#faad14', borderRadius: '8px', width: '48px', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <DatabaseOutlined style={{ color: 'white', fontSize: 24 }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
              <span style={{ color: '#98a6ad', fontSize: '14px', marginBottom: '4px' }}>总库存量</span>
              <span style={{ color: '#000000', fontSize: '24px', fontWeight: 'bold' }}>{data.totalStockQuantity ?? '-'}</span>
            </div>
          </div>
        </ProCard>
        <ProCard colSpan={{ xs: 12, sm: 12, md: 6 }} bordered hoverable>
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px' }}>
            <div style={{ marginRight: '16px' }}>
              <div style={{ backgroundColor: '#cf1322', borderRadius: '8px', width: '48px', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <WarningOutlined style={{ color: 'white', fontSize: 24 }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
              <span style={{ color: '#98a6ad', fontSize: '14px', marginBottom: '4px' }}>低库存预警</span>
              <span style={{ color: '#cf1322', fontSize: '24px', fontWeight: 'bold' }}>{data.lowStockItemCount ?? '-'}</span>
            </div>
          </div>
        </ProCard>
        <ProCard colSpan={{ xs: 12, sm: 12, md: 6 }} bordered hoverable>
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px' }}>
            <div style={{ marginRight: '16px' }}>
              <div style={{ backgroundColor: '#52c41a', borderRadius: '8px', width: '48px', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <FieldTimeOutlined style={{ color: 'white', fontSize: 24 }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
              <span style={{ color: '#98a6ad', fontSize: '14px', marginBottom: '4px' }}>今日操作次数</span>
              <span style={{ color: '#000000', fontSize: '24px', fontWeight: 'bold' }}>{data.todayTransactionCount ?? '-'}</span>
            </div>
          </div>
        </ProCard>
      </ProCard>



      {/* 图表区域 */}
      <ProCard.Group direction="row" ghost gutter={[16, 16]} wrap style={{ marginBottom: 16 }}>
        <ProCard colSpan={{ xs: 24, md: 12 }} title="库存 Top 5 物品">
          {data.topItemsByStock && data.topItemsByStock.length > 0 ? (
            <Bar2D
                id="top-items-chart"
                xData={topItemsXData}
                yData={topItemsYData}
                style={{ height: 250, width: '100%' }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>暂无数据</div>
          )}
        </ProCard>

        <ProCard colSpan={{ xs: 24, md: 12 }} title="近 7 日出入库趋势">
          <div ref={trendChartRef} style={{ height: '250px', width: '100%' }} />
        </ProCard>
      </ProCard.Group>

      <ProCard title="低库存预警列表">
        <ProTable<API.ItemVO>
          columns={lowStockColumns}
          dataSource={data.lowStockItems || []}
          rowKey="id"
          pagination={false}
          search={false}
          toolBarRender={false}
          bordered
          size="small"
        />
      </ProCard>

      {/* AI日报区域 */}
      <ProCard style={{ marginBottom: 16 }} colSpan={24}>
        <AIReport />
      </ProCard>
    </PageContainer>
  );
};

export default Dashboard; 