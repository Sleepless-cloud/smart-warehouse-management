import { listTransaction } from '@/services/api/transaction';
import { convertPageData, orderBy } from '@/utils/request';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Badge, Tag, message } from 'antd';
import { useRef, useState } from 'react';

export default () => {
  const [searchProps, setSearchProps] = useState<API.TransactionQueryDTO>({});
  
  // 定义表格列配置
  const columns: ProColumns<API.TransactionVO>[] = [
    {
      title: '操作类型',
      dataIndex: 'operationType',
      width: 100,
      valueEnum: {
        1: { text: '入库', status: 'Success' },
        0: { text: '出库', status: 'Error' },
      },
      render: (_, record: any) => {
        const type = record.operationType;
        if (type === '1') {
          return <Badge status="success" text="入库" />;
        } else if (type === '0') {
          return <Badge status="error" text="出库" />;
        } else {
          console.warn('未知的操作类型:', type);
          return <Badge status="default" text="未知" />;
        }
      },
    },
    {
      title: '物品编号',
      dataIndex: 'itemNumber',
      width: 120,
    },
    {
      title: '物品名称',
      dataIndex: 'itemName',
      width: 150,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 80,
      search: false,
    },
    {
      title: '规格',
      dataIndex: 'specification',
      width: 120,
      search: false,
    },
    {
      title: '操作数量',
      dataIndex: 'quantity',
      width: 100,
      search: false,
      render: (_, record: any) => {
        const type = record.operationType;
        if (type === '1') {
          return <Tag color="green">+{record.quantity}</Tag>;
        } else if (type === '0') {
          return <Tag color="red">-{record.quantity}</Tag>;
        } else {
          return <Tag color="default">{record.quantity}</Tag>;
        }
      },
    },
    {
      title: '操作后库存',
      dataIndex: 'postStock',
      width: 120,
      search: false,
    },
    {
      title: '经手人',
      dataIndex: 'handlerName',
      width: 100,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作时间',
      dataIndex: 'operationTime',
      width: 150,
      search: false,
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.TransactionVO>
        rowKey="id"
        request={async (params = {}, sort) => {
          const props = {
            ...params,
            orderBy: orderBy(sort),
          };
          setSearchProps(props);
          try {
            const data = await listTransaction(props);
            console.log('获取交易记录原始数据:', data);
            
            // 检查数据结构
            if (data) {
              // 检查数据的结构，API可能会返回不同结构
              const records = (data as any).list || [];
              
              if (Array.isArray(records)) {
                // 检查和打印每条记录，看数据结构是否正确
                records.forEach((item: any, index: number) => {
                  console.log(`记录 ${index+1}:`, item);
                  if (!item.type) {
                    console.warn(`记录 ${index+1} 缺少类型字段`);
                  }
                  if (!item.createdAt) {
                    console.warn(`记录 ${index+1} 缺少时间字段`);
                  }
                });
              }
            }
            
            const convertedData = convertPageData(data);
            console.log('转换后的数据:', convertedData);
            return convertedData;
          } catch (error) {
            console.error('获取交易记录错误:', error);
            message.error('获取交易记录失败');
            return {
              data: [],
              success: false,
              total: 0
            };
          }
        }}
        columns={columns}
      />
    </PageContainer>
  );
}; 