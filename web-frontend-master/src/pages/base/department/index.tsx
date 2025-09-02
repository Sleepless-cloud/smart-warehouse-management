import { deleteDepartment, listDepartment } from '@/services/api/department'; // 导入部门相关的API方法
import { convertPageData, orderBy, waitTime } from '@/utils/request'; // 导入工具函数，用于数据转换、排序和延迟
import { openConfirm } from '@/utils/ui'; // 导入确认弹窗工具函数
import { PlusOutlined, DeleteOutlined, ExportOutlined } from '@ant-design/icons'; // 导入Ant Design图标
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components'; // 导入Ant Design Pro组件
import { Button } from 'antd'; // 导入Ant Design按钮组件
import { useRef, useState } from 'react'; // 导入React的hooks
import InputDialog from './InputDialog'; // 导入自定义的输入弹窗组件
import { downloadFile } from '@/utils/download-utils'; // 导入文件下载工具函数
import { Link } from '@umijs/max'; // 导入UMI的Link组件
import ImportDialog from './ImportDialog'; // 导入自定义的导入弹窗组件

export default () => {
  const refAction = useRef<ActionType>(null); // 用于操作ProTable的引用
  const [selectedRowKeys, selectRow] = useState<number[]>([]); // 选中的行的主键数组
  const [importVisible, setImportVisible] = useState(false); // 控制导入弹窗的显示状态
  const [department, setDepartment] = useState<API.DepartmentVO>(); // 当前选中的部门数据
  const [searchProps, setSearchProps] = useState<API.DepartmentQueryDTO>({}); // 当前的查询参数
  const [visible, setVisible] = useState(false); // 控制输入弹窗的显示状态
  const [downloading, setDownloading] = useState(false); // 控制导出按钮的加载状态

  // 定义表格的列配置
  const columns: ProColumns<API.DepartmentVO>[] = [
    {
      title: '部门ID', // 列标题
      dataIndex: 'id', // 数据字段
      width: 100, // 列宽度
      search: false, // 是否显示搜索框
    },
    {
      title: '部门名称',
      dataIndex: 'departmentName',
      width: 100,
      render: (dom, record) => {
        // 渲染部门名称为可点击的链接
        return (
          <a
            onClick={() => {
              setDepartment(record); // 设置当前选中的部门数据
              setVisible(true); // 显示输入弹窗
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      width: 100,
      search: false,
    },
    {
      title: '备注',
      dataIndex: 'description',
      search: false,
    },
    {
      title: '创建人',
      dataIndex: 'createdByDesc',
      width: 100,
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 150,
      search: false,
    },
    {
      title: '操作',
      width: 100,
      fixed: 'right', // 固定列在右侧
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <Link to={`detail?id=${record.id}`}>修改</Link>, // 跳转到修改页面
      ],
    },
  ];

  // 删除选中部门的处理函数
  const handleDelete = async () => {
    if (!selectedRowKeys?.length) return; // 如果没有选中行，直接返回
    openConfirm(`您确定删除${selectedRowKeys.length}条记录吗`, async () => {
      // 弹出确认框
      await deleteDepartment(selectedRowKeys); // 调用删除API
      refAction.current?.reload(); // 刷新表格数据
    });
  };

  // 导出部门数据的处理函数
  const handleExport = () => {
    setDownloading(true); // 设置导出按钮为加载状态
    downloadFile(`/api/department/exportDepartment`, searchProps, '部门导出表.xls').then(() => {
      // 调用文件下载工具函数
      waitTime(1000).then(() => setDownloading(false)); // 延迟1秒后取消加载状态
    });
  };

  return (
    <PageContainer>
      {/* 部门管理表格 */}
      <ProTable<API.DepartmentVO>
        actionRef={refAction} // 表格操作引用
        rowKey="id" // 表格行的唯一标识
        request={async (params = {}, sort) => {
          // 请求数据的函数
          const props = {
            ...params,
            orderBy: orderBy(sort), // 处理排序参数
          };
          setSearchProps(props); // 保存查询参数
          return convertPageData(await listDepartment(props)); // 调用API获取数据并转换为表格格式
        }}
        toolBarRender={() => [
          // 工具栏按钮
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setDepartment(undefined); // 清空当前选中的部门数据
              setVisible(true); // 显示输入弹窗
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
          <Button
            type="primary"
            key="primary"
            danger
            onClick={handleDelete} // 调用删除处理函数
            disabled={!selectedRowKeys?.length} // 如果没有选中行则禁用按钮
          >
            <DeleteOutlined /> 删除
          </Button>,
          <Button
            type="primary"
            key="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setImportVisible(true); // 显示导入弹窗
            }}
          >
            导入
          </Button>,
          <Button type="default" onClick={handleExport} loading={downloading}>
            <ExportOutlined /> 导出
          </Button>,
        ]}
        columns={columns} // 表格列配置
        rowSelection={{
          // 行选择配置
          onChange: (rowKeys) => {
            selectRow(rowKeys as number[]); // 更新选中的行
          },
        }}
      />
      {/* 输入弹窗 */}
      <InputDialog
        detailData={department} // 当前选中的部门数据
        onClose={(result) => {
          setVisible(false); // 关闭弹窗
          result && refAction.current?.reload(); // 如果有更新则刷新表格
        }}
        visible={visible} // 弹窗显示状态
      />
      {/* 导入弹窗 */}
      <ImportDialog
        visible={importVisible} // 弹窗显示状态
        onClose={(count) => {
          setImportVisible(false); // 关闭弹窗
          if (count) {
            refAction.current?.reload(); // 如果有导入数据则刷新表格
          }
        }}
      />
    </PageContainer>
  );
};
