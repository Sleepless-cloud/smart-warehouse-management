import { addItem, updateItem } from '@/services/api/item';
import { waitTime } from '@/utils/request';
import { ModalForm, ProForm, ProFormDigit, ProFormInstance, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef } from 'react';

interface ItemFormProps {
  detailData?: API.ItemVO;
  visible: boolean;
  onClose: (result: boolean) => void;
}

export default function ItemForm(props: ItemFormProps) {
  const form = useRef<ProFormInstance>(null);

  useEffect(() => {
    if (props.visible && props.detailData) {
      waitTime(100).then(() => {
        form?.current?.setFieldsValue(props.detailData);
      });
    }
  }, [props.detailData, props.visible]);

  const onFinish = async (values: any) => {
    console.log('提交的表单数据:', values); // 添加日志查看提交的表单数据
    
    // 确保所有必填字段都有值
    if (!values.code && !values.name) {
      message.error('请填写完整信息');
      return false;
    }
    
    // 显式处理字段，确保都有值
    const data: any = {
      id: props.detailData?.id,
      name: values.name,
      code: values.code,      // 物品编号
      itemNumber: values.code, // 同时提供itemNumber作为备选字段名
      unit: values.unit,
      specification: values.specification,
      threshold: values.threshold,
    };

    try {
      if (props.detailData?.id) {
        await updateItem(data, { throwError: true });
        message.success('更新成功');
      } else {
        await addItem(data, { throwError: true });
        message.success('添加成功');
      }
      props.onClose(true);
      return true;
    } catch (ex: any) {
      // 打印错误信息以便调试
      console.error('保存失败:', ex?.message || ex);
      message.error('保存失败: ' + (ex?.message || '请检查网络连接'));
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
      title={props.detailData ? '编辑物品' : '添加物品'}
      open={props.visible}
    >
      <ProFormText
        name="name"
        label="物品名称"
        rules={[
          {
            required: true,
            message: '请输入物品名称！',
          },
        ]}
      />
      <ProFormText
        name="code"
        label="物品编号"
        rules={[
          {
            required: true,
            message: '请输入物品编号！',
          },
        ]}
      />
      <ProForm.Group>
        <ProFormText
          name="unit"
          label="单位"
          rules={[
            {
              required: true,
              message: '请输入物品单位！',
            },
          ]}
        />
        <ProFormText
          name="specification"
          label="规格"
          rules={[
            {
              required: true,
              message: '请输入物品规格！',
            },
          ]}
        />
      </ProForm.Group>
      <ProFormDigit
        name="threshold"
        label="库存阈值"
        min={0}
        rules={[
          {
            required: true,
            message: '请输入库存阈值！',
          },
        ]}
      />
    </ModalForm>
  );
} 