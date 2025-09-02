import { PageContainer } from '@ant-design/pro-components';
import { Card, Typography, theme, Collapse, Divider, List, Avatar } from 'antd';
import React from 'react';
import {
  LoginOutlined,
  LayoutOutlined,
  DashboardOutlined,
  BoxPlotOutlined,
  SyncOutlined,
  DatabaseOutlined,
  UserOutlined,
  LockOutlined,
  HistoryOutlined,
  TeamOutlined,
  QuestionCircleOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  SecurityScanOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const Help: React.FC = () => {
  const { token } = theme.useToken();

  const getPanelHeader = (title: string, icon: React.ReactNode) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {React.cloneElement(icon as React.ReactElement, { style: { marginRight: 10, fontSize: '18px', color: token.colorPrimary } })}
      <Text strong>{title}</Text>
    </div>
  );

  const sectionStyle: React.CSSProperties = {
    marginBottom: '40px',
  };

  const listItemStyle: React.CSSProperties = {
    padding: '8px 0',
    borderBottom: `1px dashed ${token.colorBorderSecondary}`,
    display: 'flex',
    alignItems: 'center',
  };

  const listIconStyle: React.CSSProperties = {
    marginRight: '10px',
    color: token.colorPrimary,
    fontSize: '16px',
  };

  return (
    <PageContainer title="帮助文档 - 比特云仓">
      <Card style={{ borderRadius: 8 }}>
        <Typography>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>
             比特云仓 - 操作指南
          </Title>

          {/* Section 1: Getting Started */}
          <div style={sectionStyle}>
            <Title level={3} style={{ marginBottom: 20 }}>
              <LoginOutlined style={{ marginRight: 8, color: token.colorPrimary }} /> 快速入门
            </Title>
            <Collapse defaultActiveKey={['1-1']} ghost style={{ backgroundColor: token.colorBgLayout }}>
              <Panel header={getPanelHeader("用户登录与界面", <LayoutOutlined />)} key="1-1">
                <List size="small" split={false}>
                  <List.Item style={listItemStyle}>
                    <span>输入正确的用户名和密码登录系统。</span>
                  </List.Item>
                  <List.Item style={listItemStyle}>
                    <span>"自动登录"选项可以记住您的用户名，方便下次登录。</span>
                  </List.Item>
                   <List.Item style={listItemStyle}>
                    <span>主界面包含顶部导航、左侧菜单和内容区。</span>
                  </List.Item>
                   <List.Item style={listItemStyle}>
                    <span>如忘记密码，请联系管理员。</span>
                  </List.Item>
                </List>
              </Panel>
              <Panel header={getPanelHeader("数据看板概览", <DashboardOutlined />)} key="1-2">
                <Paragraph>数据看板是系统的入口，提供关键信息概览和快捷入口。</Paragraph>
                <List size="small" split={false}>
                  <List.Item style={listItemStyle}>
                    <span>关注库存总量、出入库趋势等核心指标。</span>
                  </List.Item>
                  <List.Item style={listItemStyle}>
                    <span>点击卡片或链接可快速跳转到相应功能页面。</span>
                  </List.Item>
                </List>
              </Panel>
            </Collapse>
          </div>
          <Divider />

          {/* Section 2: Warehouse Management */}
          <div style={sectionStyle}>
            <Title level={3} style={{ marginBottom: 20 }}>
              <DatabaseOutlined style={{ marginRight: 8, color: token.colorPrimary }} /> 仓库核心操作
            </Title>
            <Collapse ghost style={{ backgroundColor: token.colorBgLayout }}>
              <Panel header={getPanelHeader("物品信息管理", <BoxPlotOutlined />)} key="2-1">
                <Paragraph>管理仓库内所有物品的基础数据。</Paragraph>
                <List size="small" split={false}>
                  <List.Item style={listItemStyle}>
                    <span>点击"添加"按钮，录入物品编号、名称、规格等信息。</span>
                  </List.Item>
                  <List.Item style={listItemStyle}>
                    <span>在列表中找到物品，点击"编辑"进行修改。</span>
                  </List.Item>
                  <List.Item style={listItemStyle}>
                    <span>选择物品后点击"删除"（注意：有库存或流水记录的物品可能无法删除）。</span>
                  </List.Item>
                  <List.Item style={listItemStyle}>
                    <span>利用搜索框或筛选条件快速查找物品。</span>
                  </List.Item>
                </List>
              </Panel>
              <Panel header={getPanelHeader("仓库动态与出入库", <SyncOutlined />)} key="2-2">
                <Paragraph>跟踪物品的流动情况。</Paragraph>
                 <List size="small" split={false}>
                  <List.Item style={listItemStyle}>
                    <span>查看详细的出入库记录，包括时间、数量、操作人等。</span>
                  </List.Item>
                  <List.Item style={listItemStyle}>
                    <span>执行入库和出库操作，准确记录物品数量变化。</span>
                  </List.Item>
                  <List.Item style={listItemStyle}>
                    <span>按时间、物品、类型等筛选查询特定的流水信息。</span>
                  </List.Item>
                </List>
              </Panel>
            </Collapse>
          </div>
           <Divider />

          {/* Section 4: System Management */}
          <div style={sectionStyle}>
            <Title level={3} style={{ marginBottom: 20 }}>
              <ToolOutlined style={{ marginRight: 8, color: token.colorPrimary }} /> 系统后台管理
            </Title>
            <Collapse ghost style={{ backgroundColor: token.colorBgLayout }}>
              <Panel header={getPanelHeader("管理员账户", <UserOutlined />)} key="4-1">
                <Paragraph>管理可以访问和操作系统的用户。</Paragraph>
                <List size="small" split={false}>
                    <List.Item style={listItemStyle}>
                      <span>添加、编辑或删除管理员账户。</span>
                    </List.Item>
                    <List.Item style={listItemStyle}>
                      <span>为不同管理员分配合适的操作权限。</span>
                    </List.Item>
                </List>
              </Panel>
              <Panel header={getPanelHeader("登录日志查询", <HistoryOutlined />)} key="4-2">
                <Paragraph>审计和追踪用户登录系统的记录。</Paragraph>
                <List size="small" split={false}>
                    <List.Item style={listItemStyle}>
                      <span>按时间、用户名等条件查询登录详情。</span>
                    </List.Item>
                </List>
              </Panel>
              <Panel header={getPanelHeader("在线用户监控", <TeamOutlined />)} key="4-3">
                 <Paragraph>查看当前已登录系统的用户列表，并可按需将用户强制下线。</Paragraph>
              </Panel>
            </Collapse>
          </div>
           <Divider />

          {/* Section 5: Account & Support */}
          <div>
            <Title level={3} style={{ marginBottom: 20 }}>
              <QuestionCircleOutlined style={{ marginRight: 8, color: token.colorPrimary }} /> 账户帮助与支持
            </Title>
            <Collapse ghost style={{ backgroundColor: token.colorBgLayout }}>
                <Panel header={getPanelHeader("寻求技术支持", <QuestionCircleOutlined />)} key="5-2">
                  <Paragraph>遇到问题时，请先尝试查阅本帮助文档。若问题无法解决，请联系您的系统管理员获取支持。</Paragraph>
                  {/* <Paragraph style={{ marginLeft: '28px' }}>联系邮箱：<Text copyable>support@example.com</Text></Paragraph> */}
                </Panel>
             </Collapse>
          </div>

        </Typography>
      </Card>
    </PageContainer>
  );
};

export default Help; 