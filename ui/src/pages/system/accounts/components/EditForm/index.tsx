import { useMemo } from 'react';
import {
  Form,
  Button,
  Input,
  Modal,
  Radio,
  Spin,
  Skeleton,
  Space,
  Divider,
  Row,
  Col,
} from 'antd';
import { useRequest } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { findBy, save } from '@/pages/system/accounts/service';
import { ShowForm } from '@/pages/system/accounts/data';

interface FormProps {
  onFinish: () => void;
  showForm: ShowForm;
}

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const EditForm = (props: FormProps) => {
  const { t } = useTranslation();

  const { onFinish, showForm } = props;
  const close = () => {
    onFinish();
  };

  const { data, loading: loadingData } =
    useRequest(() => {
      if (props.showForm.action === 'UPDATE') {
        return findBy({ userId: props.showForm.data?.userId || 0 });
      }
      return new Promise(function (resolve) {
        resolve({
          avatar: '',
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          passwordConfirm: '',
          roles: [],
          status: 'ACTIVE',
          username: '',
        });
      });
    }, {
      refreshDeps: [props.showForm],
    });

  const { loading: loadingSave, runAsync: triggerAction } = useRequest(save, {
    manual: true,
    onSuccess: (result, params) => {
      console.log('onSuccess', result, params);
    },
    onError: (error) => {
      console.log('onError', error);
    },
  });
  console.log(data, 'data', loadingData)

  const renderForm = useMemo(() => {
    const dataFrom = data || {
      avatar: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      passwordConfirm: '',
      roles: [],
      status: 'ACTIVE',
      username: '',
    };
    return (
      <Form
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={dataFrom}
        onValuesChange={() => {
        }}
        onFinish={async (values) => {
         await triggerAction({ ...dataFrom, ...values });
        }}
      >
        <FormItem
          name="username"
          label={t('User Name')}
          rules={[
            {
              required: true,
              message: t('This field isn\'t empty!'),
            },
          ]}
        >
          <Input readOnly={showForm.action === 'UPDATE'} />
        </FormItem>
        <FormItem
          name="email"
          label={t('Email')}
          rules={[
            {
              type: 'email',
              message: t('The input is not valid E-mail!'),
            },
            {
              required: true,
              message: t('This field isn\'t empty!'),
            },
          ]}
        >
          <Input readOnly={showForm.action === 'UPDATE'} />
        </FormItem>
        <FormItem
          name="status"
          label={t('Status')}
        >
          <RadioGroup buttonStyle="solid">
            <Radio.Button value="ACTIVE">
              {t('ACTIVE')}
            </Radio.Button>
            <Radio.Button value="LOCKED">
              {t('LOCKED')}
            </Radio.Button>
            <Radio.Button value="DELETED">
              {t('DELETED')}
            </Radio.Button>
            <Radio.Button value="EXPIRED">
              {t('EXPIRED')}
            </Radio.Button>
          </RadioGroup>
        </FormItem>
        <FormItem label="Full name" style={{ marginBottom: 0 }} required={true}>
          <FormItem
            name="firstName"
            rules={[{ required: true }]}
            style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
          >
            <Input />
          </FormItem>
          <FormItem
            name="lastName"
            rules={[{ required: true }]}
            style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px' }}
          >
            <Input />
          </FormItem>
        </FormItem>
        <FormItem
          name="password"
          label="Password"
          rules={[
            {
              required: showForm.action !== 'UPDATE',
              message: t('Please input your password!'),
            },
          ]}
          hasFeedback
        >
          <Input.Password />
        </FormItem>
        <FormItem
          name="passwordConfirm"
          label="Confirm Password"
          dependencies={['password']}
          hasFeedback
          rules={[
            {
              required: showForm.action !== 'UPDATE',
              message: 'Please confirm your password!',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error('The two passwords that you entered do not match!'),
                );
              },
            }),
          ]}
        >
          <Input.Password />
        </FormItem>
        <Divider />
        <Row>
          <Col span={18} offset={6}>
            <Space>
              <Button onClick={close}>
                {t('Cancel')}
              </Button>
              <Button type="primary" htmlType="submit">
                {t('Save')}
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    );
  }, [data]);

  return (
    <>
      <Modal
        width={800}
        destroyOnClose
        maskClosable={false}
        title={
          showForm.action === 'ADD' ? t('Update Account') : t('Add Account')
        }
        open={showForm.visible}
        onCancel={close}
        footer={null}
      >
        {loadingData && <Skeleton active />}
        {!loadingData && <Spin spinning={loadingSave}>{renderForm}</Spin>}
      </Modal>
    </>
  );
};

export default EditForm;
