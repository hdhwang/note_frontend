import React, { useState, useEffect } from 'react';
import { useSettings } from './settings_context';
import { Layout, Button, Input, message, Modal, Checkbox, Form, Space, Dropdown, Select, Tag, Radio, Descriptions } from "antd";
import { SmartTable } from "./SmartTable";
import { useQuery } from '@tanstack/react-query';
import { useUrlQueryParams } from '../hooks/useUrlQueryParams';
import type { MenuProps, TablePaginationConfig } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import '../App.css';
import apiClient from './api/api_client';
import dayjs from 'dayjs';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, EyeOutlined, InfoCircleOutlined } from "@ant-design/icons";

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
  const [queryParams, setQueryParams] = useUrlQueryParams('id');

  const { data, isFetching, refetch, dataUpdatedAt } = useQuery({
      queryKey: ['users', queryParams],
      queryFn: async () => {
          const params = { page: queryParams.page, page_size: queryParams.pageSize, ordering: queryParams.ordering, ...queryParams.filters };
          const response = await apiClient.get('account/users', { params });
          return response.data;
      }
  });

  const loading = isFetching;
  const result = data?.results || [];
  const pagination = { current: queryParams.page, pageSize: queryParams.pageSize, total: data?.count || 0 };

  const [visibleColumns, setVisibleColumns] = useState({
    user_id: true,
    name: true,
    email: true,
    status: true,
    permission: true,
    last_login: true,
    created_at: true,
    actions: true,
  });

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, record: UserData | null }>({ visible: false, x: 0, y: 0, record: null });
  const [form] = Form.useForm();

  const columnLabels: Record<string, string> = {
    user_id: '아이디',
    name: '이름',
    email: '이메일',
    status: '상태',
    permission: '권한',
    last_login: '최근 로그인',
    created_at: '생성 일자',
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
      title: '최근 로그인',
      dataIndex: 'last_login',
      key: 'last_login',
      align: 'center' as const,
      sorter: true,
      render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '생성 일자',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center' as const,
      sorter: true,
      render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '작업',
      key: 'actions',
      align: 'center' as const,
      render: (_: any, record: UserData) => (
        <Space size={2}>
          <Button type="text" icon={<InfoCircleOutlined />} onClick={(e) => { e.stopPropagation(); showDetail(record); }} />
          <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); showEditModal(record); }} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }} />
        </Space>
      ),
    },
  ];

  const columns = allColumns.map(col => {
      if (col.key && (col as any).sorter) {
          const orderParam = queryParams.ordering;
          let sortOrder: 'ascend' | 'descend' | null = null;
          if (orderParam === col.key) sortOrder = 'ascend';
          else if (orderParam === `-${col.key}`) sortOrder = 'descend';
          return { ...col, sortOrder };
      }
      return col;
  }).filter(column =>
    column.key === 'index' || visibleColumns[column.key as keyof typeof visibleColumns]
  ) as ColumnsType<UserData>;

  const getData = (page = queryParams.page, pageSize = queryParams.pageSize, ordering = queryParams.ordering, filters = queryParams.filters) => {
      setQueryParams({ page, pageSize, ordering, filters });
      if (page === queryParams.page && pageSize === queryParams.pageSize && ordering === queryParams.ordering && JSON.stringify(filters) === JSON.stringify(queryParams.filters)) {
          refetch();
      }
  };

  const showDetail = (user: UserData) => {
    setCurrentUser(user);
    setIsDetailModalVisible(true);
  };

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
            lastRefreshed={dataUpdatedAt}
            size={settings.tableDensity}
            dataSource={result}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            rowKey="id"
            scroll={{ x: 'max-content' }}
            onRow={(record: UserData) => ({
                onContextMenu: (e) => {
                    e.preventDefault();
                    if (!contextMenu.visible) {
                        const closeMenu = () => {
                            setContextMenu({ visible: false, x: 0, y: 0, record: null });
                            document.removeEventListener('click', closeMenu);
                        };
                        document.addEventListener('click', closeMenu);
                    }
                    setContextMenu({
                        visible: true,
                        x: e.clientX,
                        y: e.clientY,
                        record
                    });
                }
            })}
          />
          {contextMenu.visible && contextMenu.record && (
              <ul style={{
                  position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 9999,
                  background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  listStyle: 'none', padding: '4px 0', margin: 0, minWidth: '120px'
              }}>
                  <li style={{ padding: '8px 16px', cursor: 'pointer' }} onClick={() => { getData(pagination.current, pagination.pageSize); setContextMenu(prev => ({...prev, visible: false})); }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <ReloadOutlined style={{ marginRight: 8 }} /> 새로고침
                  </li>
                  <li style={{ height: 1, background: '#f0f0f0', margin: '4px 0' }} />
                  <li style={{ padding: '8px 16px', cursor: 'pointer' }} onClick={() => { showEditModal(contextMenu.record!); setContextMenu(prev => ({...prev, visible: false})); }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <EditOutlined style={{ marginRight: 8 }} /> 수정
                  </li>
                  <li style={{ padding: '8px 16px', cursor: 'pointer', color: 'red' }} onClick={() => { handleDelete(contextMenu.record!.id); setContextMenu(prev => ({...prev, visible: false})); }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff1f0'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <DeleteOutlined style={{ marginRight: 8 }} /> 삭제
                  </li>
                  <li style={{ height: 1, background: '#f0f0f0', margin: '4px 0' }} />
                  <li style={{ padding: '8px 16px', cursor: 'pointer' }} onClick={() => { showDetail(contextMenu.record!); setContextMenu(prev => ({...prev, visible: false})); }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <InfoCircleOutlined style={{ marginRight: 8 }} /> 상세 보기
                  </li>
              </ul>
          )}
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

      <Modal title="사용자 상세" open={isDetailModalVisible} onCancel={() => setIsDetailModalVisible(false)} footer={[<Button key="close" onClick={() => setIsDetailModalVisible(false)}>닫기</Button>]}>
          {currentUser && (
              <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="아이디">{currentUser.user_id}</Descriptions.Item>
                  <Descriptions.Item label="이름">{currentUser.name}</Descriptions.Item>
                  <Descriptions.Item label="이메일">{currentUser.email}</Descriptions.Item>
                  <Descriptions.Item label="상태">
                      {(() => {
                          let color = currentUser.status === '활성화' ? 'green' : 'volcano';
                          return <Tag color={color}>{currentUser.status}</Tag>;
                      })()}
                  </Descriptions.Item>
                  <Descriptions.Item label="권한">
                      {currentUser.permission?.map(p => (
                          <Tag color={p === '관리자' ? 'blue' : 'default'} key={p}>{p}</Tag>
                      ))}
                  </Descriptions.Item>
                  <Descriptions.Item label="최근 로그인">{currentUser.last_login ? dayjs(currentUser.last_login).format('YYYY-MM-DD HH:mm:ss') : '-'}</Descriptions.Item>
                  <Descriptions.Item label="생성 일자">{currentUser.created_at ? dayjs(currentUser.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}</Descriptions.Item>
              </Descriptions>
          )}
      </Modal>
    </div>
  );
}

export default Users;
