import { addItem, deleteItem, listItem, updateItem, parseAndAddItemsViaAI, exportItem } from '@/services/api/item';
import { checkIn, checkOut } from '@/services/api/transaction';
import { convertPageData, orderBy, waitTime } from '@/utils/request';
import { openConfirm } from '@/utils/ui';
import { PlusOutlined, DeleteOutlined, ExportOutlined } from '@ant-design/icons';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, message, Tag } from 'antd';
import { useRef, useState } from 'react';
import ItemForm from './components/ItemForm';
import CheckInOutForm from './components/CheckInOutForm';
import QuickAddForm from './components/QuickAddForm';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { downloadFile } from '@/utils/download-utils';

export default () => {
  const refAction = useRef<ActionType>(null);
  const [selectedRowKeys, selectRow] = useState<number[]>([]);
  const [item, setItem] = useState<API.ItemVO>();
  const [itemFormVisible, setItemFormVisible] = useState(false);
  const [checkInFormVisible, setCheckInFormVisible] = useState(false);
  const [checkOutFormVisible, setCheckOutFormVisible] = useState(false);
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [searchProps, setSearchProps] = useState<API.ItemQueryDTO>({});
  const [downloading, setDownloading] = useState(false);
  
  // 添加流动彩色按钮的样式
  const rainbowButtonStyle = useEmotionCss(() => {
    return {
      background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
      backgroundSize: '400% 400%',
      animation: 'gradient 3s ease infinite',
      color: 'white',
      fontWeight: 'bold',
      border: 'none',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
      '@keyframes gradient': {
        '0%': {
          backgroundPosition: '0% 50%'
        },
        '50%': {
          backgroundPosition: '100% 50%'
        },
        '100%': {
          backgroundPosition: '0% 50%'
        }
      },
      '&:hover': {
        opacity: 0.9,
        transform: 'translateY(-2px)',
        transition: 'all 0.3s',
        color: 'white'
      }
    };
  });

  // 定义表格列配置
  const columns: ProColumns<API.ItemVO>[] = [
    {
      title: '物品编号',
      dataIndex: 'itemNumber',
      width: 120,
      // sorter: {
      //   compare: (a, b) => a.itemNumber.localeCompare(b.itemNumber),
      //   multiple: 1
      // },
    },
    {
      title: '物品名称',
      dataIndex: 'name',
      width: 150,
      sorter: {
        compare: (a, b) => a.name.localeCompare(b.name),
        multiple: 2
      },
      render: (dom, record) => {
        return (
          <a
            onClick={() => {
              setItem(record);
              setItemFormVisible(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '规格',
      dataIndex: 'specification',
      width: 120,
      search: false,
      // sorter: {
      //   compare: (a, b) => a.specification.localeCompare(b.specification),
      //   multiple: 3
      // },
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 80,
      search: false,
      sorter: {
        compare: (a, b) => a.unit.localeCompare(b.unit),
        multiple: 4
      },
    },
    {
      title: '库存数量',
      dataIndex: 'stockQuantity',
      width: 100,
      search: false,
      sorter: {
        compare: (a, b) => (a.stockQuantity || 0) - (b.stockQuantity || 0),
        multiple: 5
      },
      render: (_, record) => {
        const quantity = record.stockQuantity || 0;
        const threshold = record.threshold || 0;
        if (quantity <= threshold) {
          return <Tag color="red">{quantity}</Tag>;
        }
        return quantity;
      },
    },
    {
      title: '库存阈值',
      dataIndex: 'threshold',
      width: 100,
      search: false,
      sorter: {
        compare: (a, b) => a.threshold - b.threshold,
        multiple: 6
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 150,
      search: false,
      sorter: {
        compare: (a, b) => a.createdAt.localeCompare(b.createdAt),
        multiple: 7
      },
    },
    {
      title: '修改时间',
      dataIndex: 'updatedAt',
      width: 150,
      search: false,
      sorter: {
        compare: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
        multiple: 8
      },
    },
    {
      title: '操作人',
      dataIndex: 'operatorName',
      width: 100,
      search: false,
      sorter: {
        compare: (a, b) => a.operatorName?.localeCompare(b.operatorName || ''),
        multiple: 9
      },
    },
    {
      title: '操作',
      width: 180,
      fixed: 'right',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setItem(record);
            setItemFormVisible(true);
          }}
        >
          编辑
        </a>,
        <a
          key="checkIn"
          onClick={() => {
            setItem(record);
            setCheckInFormVisible(true);
          }}
        >
          入库
        </a>,
        <a
          key="checkOut"
          onClick={() => {
            setItem(record);
            setCheckOutFormVisible(true);
          }}
        >
          出库
        </a>,
      ],
    },
  ];

  // 删除选中物品
  const handleDelete = async () => {
    if (!selectedRowKeys?.length) return;
    openConfirm(`您确定删除${selectedRowKeys.length}条记录吗`, async () => {
      await deleteItem(selectedRowKeys);
      refAction.current?.reload();
      selectRow([]);
    });
  };

  // 导出物品数据
  const handleExport = () => {
    setDownloading(true);
    downloadFile(`/api/item/exportItem`, searchProps, '物品导出表.xls').then(() => {
      waitTime(1000).then(() => setDownloading(false));
    });
  };

  // 更新 Quick Add handler
  const handleQuickAdd = async (description: string) => {
    try {
      // Show loading message
      message.loading({ content: 'AI分析中...', key: 'quickAddLoading', duration: 0 });
      
      // Call the backend API to parse and add items
      const result = await parseAndAddItemsViaAI(description);
      console.log("Backend AI Response:", result);
      
      // Display result message from backend
      if (result && result.success) {
        message.success({ content: result.message || `处理完成，添加了 ${result.addedCount || 0} 个物品`, key: 'quickAddLoading' });
        if (result.addedCount > 0) {
           refAction.current?.reload();
        }
      } else {
        message.error({ content: result?.message || '处理失败，未能添加任何物品', key: 'quickAddLoading' });
      }
    } catch (error: any) {
      console.error('处理失败:', error);
      const errorMsg = error?.data?.message || error?.message || '请求失败，请检查网络或联系管理员';
      message.error({ content: `处理失败: ${errorMsg}`, key: 'quickAddLoading' });
      throw error; // Re-throw to let the form component handle the loading state
    }
  };

  return (
    <PageContainer>
      <ProTable<API.ItemVO>
        actionRef={refAction}
        rowKey="id"
        request={async (params = {}, sort) => {
          const props = {
            ...params,
            orderBy: orderBy(sort),
          };
          setSearchProps(props);
          return convertPageData(await listItem(props));
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="add"
            onClick={() => {
              setItem(undefined);
              setItemFormVisible(true);
            }}
          >
            <PlusOutlined /> 添加物品
          </Button>,
          <Button
            type="primary"
            key="quickAdd"
            onClick={() => setQuickAddVisible(true)}
            className={rainbowButtonStyle}
          >
            智能添加
          </Button>,
          <Button
            type="primary"
            key="delete"
            danger
            onClick={handleDelete}
            disabled={!selectedRowKeys?.length}
          >
            <DeleteOutlined /> 删除
          </Button>,
          <Button 
            type="default" 
            key="export"
            onClick={handleExport} 
            loading={downloading}
          >
            <ExportOutlined /> 导出
          </Button>,
        ]}
        columns={columns}
        rowSelection={{
          onChange: (rowKeys) => {
            selectRow(rowKeys as number[]);
          },
          selectedRowKeys,
          columnWidth: 32,
          columnTitle: false,
          fixed: true,
        }}
      />
      
      {/* 物品表单 */}
      <ItemForm
        detailData={item}
        visible={itemFormVisible}
        onClose={(result) => {
          setItemFormVisible(false);
          result && refAction.current?.reload();
        }}
      />
      
      {/* 入库表单 */}
      <CheckInOutForm
        detailData={item}
        visible={checkInFormVisible}
        type="in"
        onClose={(result) => {
          setCheckInFormVisible(false);
          result && refAction.current?.reload();
        }}
      />
      
      {/* 出库表单 */}
      <CheckInOutForm
        detailData={item}
        visible={checkOutFormVisible}
        type="out"
        onClose={(result) => {
          setCheckOutFormVisible(false);
          result && refAction.current?.reload();
        }}
      />

      {/* 智能添加表单 */}
      <QuickAddForm
        visible={quickAddVisible}
        onClose={() => setQuickAddVisible(false)}
        onSubmit={handleQuickAdd}
      />
    </PageContainer>
  );
}; 