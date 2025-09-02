import { Modal, Input, Form } from 'antd';
import { useState } from 'react';

const { TextArea } = Input;

interface QuickAddFormProps {
  visible: boolean;
  onClose: (result?: boolean) => void;
  onSubmit: (description: string) => void;
}

const QuickAddForm: React.FC<QuickAddFormProps> = ({ visible, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onSubmit(values.description);
      form.resetFields();
      onClose(true);
    } catch (error) {
      // Form validation error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="智能添加物品"
      open={visible}
      onCancel={() => onClose()}
      onOk={handleSubmit}
      confirmLoading={loading}
      maskClosable={false}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="description"
          label="请输入物品描述："
          rules={[{ required: true, message: '请输入物品描述' }]}
        >
          <TextArea
            rows={4}
            placeholder="例如：我要入库一些东西，有 50 台联想 ThinkStation P360 图形工作站，适合复杂图形处理；20 套希沃教室系统；10 台 H3C E552C-PWR 48 口交换机；还有一些NVIDIA 4090显卡，其中交换机的库存阈值为5，其余均保持默认。"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuickAddForm; 