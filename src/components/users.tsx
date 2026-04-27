import React, { useState, useEffect } from 'react';
import { useSettings } from './settings_context';
import { Layout, Button, Input, message, Modal, Checkbox, Form, Space, Dropdown, Select, Tag, Radio } from "antd";
import { SmartTable } from "./SmartTable";
import type { MenuProps, TablePaginationConfig } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import '../App.css';
import apiClient from './api/api_client';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import moment from 'moment';

const { Content } = Layout;
const { Option } = Select;

interface UserData {
  id: number;
  user_id: string;
  name: string;
  email: string;
  status: string;
  permission: string[];
  created_at: string;
  last_login: string | null;
}

const Users: React.FC = () => {
  const { settings } = useSettings();
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<UserData[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const [visibleColumns, setVisibleColumns] = useState({
    user_id: true,
    name: true,
    email: true,
    status: true,
    permission: true,
    created_at: true,
    last_login: true,
    actions: true,
  });

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [form] = Form.useForm();

  const columnLabels: Record<string, string> = {
    user_id: '아이디',
    name: '이름',
    email: '이메일',
    status: '상태',
    permission: '권한',
    created_at: '가입 일자',
    last_login: '최근 로그인',
    actions: '작업',
  };

  const handleColumnVisibilityChange = (columnKey: string) => {
    setVisibleColumns(prevState => ({
      ...prevState,
      [columnKey as keyof typeof visibleColumns]: !prevState[columnKey as keyof typeof visibleColumns],
    }));
  };

  const menuItems: MenuProps['items'] = Object.keys(columnLabels).map(columnKey => ({
    key: columnKey,
    label: (
      <Checkbox
        checked={visibleColumns[columnKey as keyof typeof visibleColumns]}
        onChange={() => handleColumnVisibilityChange(columnKey)}
        onClick={(e) => e.stopPropagation()}
      >
        {columnLabels[columnKey]}
      </Checkbox>
    ),
  }));

  const allColumns: ColumnType<UserData>[] = [
    {
      title: '번호',
      dataIndex: 'index',
      key: 'index',
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: '아이디',
      dataIndex: 'user_id',
      key: 'user_id',
      align: 'center' as const,
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>확인</Button>
            <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>초기화</Button>
          </Space>
        </div>
      ),
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      align: 'center' as const,
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>확인</Button>
            <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>초기화</Button>
          </Space>
        </div>
      ),
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
      align: 'center' as const,
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>확인</Button>
            <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>초기화</Button>
          </Space>
        </div>
      ),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
      sorter: true,
      filters: [
        { text: '활성화', value: '활성화' },
        { text: '비활성화', value: '비활성화' },
      ],
      filterMultiple: false,
      render: (status: string) => {
        let color = status === '활성화' ? 'green' : 'volcano';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: '권한',
      dataIndex: 'permission',
      key: 'permission',
      align: 'center' as const,
      sorter: true,
      filters: [
        { text: '사용자', value: '사용자' },
        { text: '관리자', value: '관리자' },
      ],
      filterMultiple: false,
      render: (permissions: string[]) => (
        <>
          {permissions.map(p => (
            <Tag color={p === '관리자' ? 'blue' : 'default'} key={p}>{p}</Tag>
          ))}
        </>
      ),
    },
    {
      title: '가입 일자',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center' as const,
      sorter: true,
      render: (text: string) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '최근 로그인',
      dataIndex: 'last_login',
      key: 'last_login',
      align: 'center' as const,
      sorter: true,
      render: (text: string) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '작업',
      key: 'actions',
      align: 'center' as const,
      render: (_: any, record: UserData) => (
        <Space size={2}>
          <Button type="text" icon={<EditOutlined />} onClick={() => showEditModal(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  const columns = allColumns.filter(column =>
    column.key === 'index' || visibleColumns[column.key as keyof typeof visibleColumns]
  ) as ColumnsType<UserData>;

  const getData = async (page = 1, pageSize = 10, ordering = 'id', filters = {}) => {
    setLoading(true);
    try {
      const params = { page, page_size: pageSize, ordering, ...filters };
      const response = await apiClient.get('account/users', { params });
      setResult(response.data.results);
      setPagination({ current: page, pageSize, total: response.data.count });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getData(); }, []);

  const showEditModal = (user: UserData) => {
    setCurrentUser(user);
    form.setFieldsValue({
        ...user,
        permission: user.permission && user.permission.length > 0 ? user.permission[0] : '사용자',
        password: '',
        confirmPassword: '',
    });
    setIsModalVisible(true);
  };

  const showAddModal = () => {
    form.resetFields();
    setIsAddModalVisible(true);
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      
      const payload = {
        user_id: values.user_id,
        password: values.password,
        name: values.name,
        email: values.email,
        user_status: values.status,
        permission: values.permission,
      };

      await apiClient.post('account/users', payload);
      message.success('사용자 추가에 성공하였습니다.');
      setIsAddModalVisible(false);
      getData(pagination.current, pagination.pageSize);
    } catch (e: any) {
      if (e.response && e.response.status === 409) {
          message.error('이미 존재하는 아이디입니다.');
      } else {
          message.error('사용자 추가에 실패하였습니다.');
      }
    }
  };

  const handleEdit = async () => {
    if (!currentUser) return;
    try {
      const values = await form.validateFields();
      
      const payload: any = {
        name: values.name,
        email: values.email,
        is_active: values.status,
        permission: values.permission,
      };

      if (values.password) {
          payload.password = values.password;
      }

      await apiClient.put(`account/users/${currentUser.id}`, payload);
      message.success('사용자 편집에 성공하였습니다.');
      setIsModalVisible(false);
      getData(pagination.current, pagination.pageSize);
    } catch (e) { message.error('사용자 편집에 실패하였습니다.'); }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '해당 사용자를 삭제하시겠습니까?',
      content: '본인의 계정은 삭제할 수 없습니다.',
      okType: 'danger',
      onOk: async () => {
        try {
          await apiClient.delete(`account/users/${id}`);
          message.success('사용자 삭제에 성공하였습니다.');
          getData(pagination.current, pagination.pageSize);
        } catch (e: any) {
          if (e.response && e.response.status === 400) {
              message.error('본인의 계정은 삭제할 수 없습니다.');
          } else {
              message.error('사용자 삭제에 실패하였습니다.');
          }
        }
      }
    });
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, any>,
    sorter: any
  ) => {
    const order = sorter.field ? (sorter.order === 'ascend' ? sorter.field : `-${sorter.field}`) : 'id';
    getData(pagination.current || 1, pagination.pageSize || 10, order, filters);
  };

  return (
    <div>
      <Content style={{ padding: '24px' }}>
        <div style={{ width: "100%" }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, flexWrap: 'wrap', gap: '8px 0' }}>
            <Space wrap>
              <Button className="responsive-icon-btn" icon={<ReloadOutlined />} onClick={() => getData(pagination.current, pagination.pageSize)}>새로고침</Button>
              <Button className="responsive-icon-btn" icon={<PlusOutlined />} onClick={showAddModal}>사용자 추가</Button>
              <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                <Button className="responsive-icon-btn" icon={<EyeOutlined />}>필드 보기</Button>
              </Dropdown>
            </Space>
          </div>
          <SmartTable tableId="users_table"
            size={settings.tableDensity}
            dataSource={result}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            rowKey="id"
            scroll={{ x: 'max-content' }}
          />
        </div>
      </Content>

      <Modal title="사용자 추가" open={isAddModalVisible} onOk={handleAdd} onCancel={() => setIsAddModalVisible(false)}>
        <Form form={form} layout="vertical" initialValues={{ status: '활성화', permission: '사용자' }}>
          <Form.Item name="user_id" label="아이디" rules={[{ required: true, message: '아이디를 입력해주세요.' }]}>
              <Input />
          </Form.Item>
          <Form.Item name="password" label="비밀번호" rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}>
              <Input.Password />
          </Form.Item>
          <Form.Item
              name="confirmPassword"
              label="비밀번호 확인"
              dependencies={['password']}
              rules={[
                  { required: true, message: '비밀번호를 다시 입력해주세요.' },
                  ({ getFieldValue }) => ({
                      validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                          }
                          return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
                      },
                  }),
              ]}
          >
              <Input.Password />
          </Form.Item>
          <Form.Item name="name" label="이름" rules={[{ required: true, message: '이름을 입력해주세요.' }]}>
              <Input />
          </Form.Item>
          <Form.Item name="email" label="이메일" rules={[{ required: true, type: 'email', message: '올바른 이메일을 입력해주세요.' }]}>
              <Input />
          </Form.Item>
          <Form.Item name="status" label="상태" rules={[{ required: true }]}>
            <Radio.Group options={['활성화', '비활성화']} />
          </Form.Item>
          <Form.Item name="permission" label="권한" rules={[{ required: true, message: '권한을 선택해주세요.' }]}>
            <Radio.Group options={['사용자', '관리자']} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="사용자 편집" open={isModalVisible} onOk={handleEdit} onCancel={() => setIsModalVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="user_id" label="아이디">
              <Input disabled />
          </Form.Item>
          <Form.Item name="password" label="새 비밀번호">
              <Input.Password placeholder="변경하지 않으려면 비워두세요." />
          </Form.Item>
          <Form.Item
              name="confirmPassword"
              label="새 비밀번호 확인"
              dependencies={['password']}
              rules={[
                  ({ getFieldValue }) => ({
                      validator(_, value) {
                          const password = getFieldValue('password');
                          if (!password && !value) {
                              return Promise.resolve();
                          }
                          if (password && !value) {
                              return Promise.reject(new Error('새 비밀번호를 다시 입력해주세요.'));
                          }
                          if (password === value) {
                              return Promise.resolve();
                          }
                          return Promise.reject(new Error('새 비밀번호가 일치하지 않습니다.'));
                      },
                  }),
              ]}
          >
              <Input.Password placeholder="변경하지 않으려면 비워두세요." />
          </Form.Item>
          <Form.Item name="name" label="이름" rules={[{ required: true, message: '이름을 입력해주세요.' }]}>
              <Input />
          </Form.Item>
          <Form.Item name="email" label="이메일" rules={[{ required: true, type: 'email', message: '올바른 이메일을 입력해주세요.' }]}>
              <Input />
          </Form.Item>
          <Form.Item name="status" label="상태" rules={[{ required: true }]}>
            <Radio.Group options={['활성화', '비활성화']} />
          </Form.Item>
          <Form.Item name="permission" label="권한" rules={[{ required: true, message: '권한을 선택해주세요.' }]}>
            <Radio.Group options={['사용자', '관리자']} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Users;
