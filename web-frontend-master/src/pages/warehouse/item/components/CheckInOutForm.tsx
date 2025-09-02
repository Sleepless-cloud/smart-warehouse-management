import { checkIn, checkOut } from '@/services/api/transaction';
import { ModalForm, ProFormDigit, ProFormInstance, ProFormText, ProFormTextArea, ProForm } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef } from 'react';
import { useModel } from '@umijs/max';

interface CheckInOutFormProps {
  detailData?: API.ItemVO;
  visible: boolean;
  type: 'in' | 'out';
  onClose: (result: boolean) => void;
}

export default function CheckInOutForm(props: CheckInOutFormProps) {
  const form = useRef<ProFormInstance>(null);
  // 获取当前登录用户信息
  const { initialState } = useModel('@@initialState');
  // 使用currentToken获取用户信息
  const currentUser = initialState?.currentToken;

  useEffect(() => {
    if (props.visible && props.detailData) {
      // 设置表单初始值
      form?.current?.setFieldsValue({
        itemId: props.detailData.id,
        itemName: props.detailData.name,
        itemCode: props.detailData.itemNumber || '',
        unit: props.detailData.unit || '',
        specification: props.detailData.specification || '',
        currentQuantity: props.detailData.stockQuantity || 0,
        // 设置经手人信息 - 使用当前登录用户的信息
        operator: currentUser?.userName || '',
      });
    }
  }, [props.detailData, props.visible, currentUser]);

  const onFinish = async (values: any) => {
    console.log('提交的表单数据:', values); // 打印提交的数据，便于调试
    
    const { quantity, remark } = values;
    
    // 确保用户已登录
    if (!currentUser?.userId) {
      message.error('无法获取当前用户信息，请重新登录！');
      return false;
    }
    
    const data: any = {
      itemId: props.detailData?.id,
      quantity: Number(quantity), // 确保数量是数字类型
      // 使用当前登录用户的ID作为经手人ID
      handlerId: Number(currentUser.userId) || 0, // 转换为数字
      // 添加更多可能的字段，以适应后端需求
      type: props.type === 'in' ? 'IN' : 'OUT', // 显式设置类型
      // 也可以提供用户名称
      handlerName: currentUser.userName || '',
      // 使用operator字段提供经手人名称，兼容部分API
      operator: currentUser.userName || '',
      remark,
    };

    console.log('发送的数据:', data); // 调试用

    try {
      let response;
      if (props.type === 'in') {
        response = await checkIn(data, { throwError: true });
        console.log('入库操作响应:', response); // 记录响应
        message.success('入库成功');
      } else {
        // 检查库存是否足够
        const currentQuantity = props.detailData?.stockQuantity || 0;
        if (quantity > currentQuantity) {
          message.error('出库数量不能大于当前库存');
          return false;
        }
        response = await checkOut(data, { throwError: true });
        console.log('出库操作响应:', response); // 记录响应
        message.success('出库成功');
      }
      
      // 检查响应是否包含更新后的库存信息
      if (response && typeof response === 'object') {
        console.log('操作成功，返回数据:', response);
        // 这里可以添加额外的处理逻辑，比如显示更新后的库存
      }
      
      props.onClose(true);
      return true;
    } catch (ex: any) {
      // 打印错误信息以便调试
      console.error('操作失败 - 详细错误:', ex);
      console.error('错误消息:', ex?.message);
      console.error('错误响应:', ex?.response?.data);
      message.error('操作失败: ' + (ex?.message || '请检查网络连接'));
      return false;
    }
  };

  return (
    <ModalForm
      width={600}
      onFinish={onFinish}
      formRef={form}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => props.onClose(false),
      }}
      title={props.type === 'in' ? '物品入库' : '物品出库'}
      open={props.visible}
    >
      <ProFormText 
        name="itemName" 
        label="物品名称" 
        disabled 
        placeholder={props.detailData?.name || ''}
      />
      <ProFormText 
        name="itemCode" 
        label="物品编号" 
        disabled 
        placeholder={props.detailData?.itemNumber || ''}
      />
      <ProForm.Group>
        <ProFormText 
          name="unit" 
          label="单位" 
          disabled 
          placeholder={props.detailData?.unit || ''}
        />
        <ProFormText 
          name="specification" 
          label="规格" 
          disabled 
          placeholder={props.detailData?.specification || ''}
        />
      </ProForm.Group>
      <ProFormText 
        name="currentQuantity" 
        label="当前库存" 
        disabled 
        placeholder={String(props.detailData?.stockQuantity || '0')}
      />
      <ProFormDigit
        name="quantity"
        label={props.type === 'in' ? '入库数量' : '出库数量'}
        min={1}
        rules={[
          {
            required: true,
            message: props.type === 'in' ? '请输入入库数量！' : '请输入出库数量！',
          },
        ]}
      />
      <ProFormText
        name="operator"
        label="经手人"
        disabled
        placeholder="自动使用当前登录用户"
      />
      <ProFormTextArea name="remark" label="备注" placeholder="请输入备注信息（可选）" />
    </ModalForm>
  );
} 