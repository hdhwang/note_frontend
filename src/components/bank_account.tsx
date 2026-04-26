import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Button, Input, message, Modal, Checkbox, Form, Space, Dropdown } from "antd";
import type { MenuProps, TablePaginationConfig } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import '../App.css';
import apiClient from './api/api_client';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, EyeOutlined } from "@ant-design/icons";

const { Content } = Layout;

// 1. 데이터 구조 인터페이스 정의
interface BankAccountData {
  id: number;
  bank: string;
  account: string;
  account_holder: string;
  description: string;
}

// 2. Props 타입 정의
interface BankAccountProps {
  collapsed: boolean;
}

const BankAccount: React.FC<BankAccountProps> = ({ collapsed }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<BankAccountData[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const [visibleColumns, setVisibleColumns] = useState({
    bank: true,
    account: true,
    account_holder: true,
    description: true,
    actions: true,
  });

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [currentAccount, setCurrentAccount] = useState<BankAccountData | null>(null);
  const [form] = Form.useForm();

  const columnLabels: Record<string, string> = {
    bank: '은행',
    account: '계좌번호',
    account_holder: '예금주',
    description: '설명',
    actions: '작업',
  };

  const handleColumnVisibilityChange = (columnKey: string) => {
    setVisibleColumns(prevState => ({
      ...prevState,
      [columnKey as keyof typeof visibleColumns]: !prevState[columnKey as keyof typeof visibleColumns],
    }));
  };

  // Dropdown 메뉴 아이템 구성
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

  // 전체 컬럼 정의 (align: 'center' as const 적용)
  const allColumns: ColumnType<BankAccountData>[] = [
    {
      title: '번호',
      dataIndex: 'index',
      key: 'index',
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: '은행',
      dataIndex: 'bank',
      key: 'bank',
      align: 'center' as const,
      sorter: true,
    },
    {
      title: '계좌번호',
      dataIndex: 'account',
      key: 'account',
      align: 'center' as const,
    },
    {
      title: '예금주',
      dataIndex: 'account_holder',
      key: 'account_holder',
      align: 'center' as const,
      sorter: true,
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      align: 'center' as const,
    },
    {
      title: '작업',
      key: 'actions',
      align: 'center' as const,
      render: (_: any, record: BankAccountData) => (
          <Space>
            <Button type="primary" icon={<EditOutlined />} onClick={() => showEditModal(record)} />
            <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Space>
      ),
    },
  ];

  // 필터링된 컬럼 생성 및 타입 단언 (TS2322 해결)
  const columns = allColumns.filter(column =>
      column.key === 'index' || visibleColumns[column.key as keyof typeof visibleColumns]
  ) as ColumnsType<BankAccountData>;

  const getData = async (page = 1, pageSize = 10, ordering = 'bank', filters = {}) => {
    setLoading(true);
    try {
      const params = { page, page_size: pageSize, ordering, ...filters };
      const response = await apiClient.get('bank-account', { params });
      setResult(response.data.results);
      setPagination({ current: page, pageSize, total: response.data.count });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getData(); }, []);

  const showEditModal = (account: BankAccountData) => {
    setCurrentAccount(account);
    form.setFieldsValue(account);
    setIsModalVisible(true);
  };

  const showAddModal = () => {
    form.resetFields();
    setIsAddModalVisible(true);
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      await apiClient.post('bank-account', values);
      message.success('추가 성공');
      setIsAddModalVisible(false);
      getData();
    } catch (e) { message.error('추가 실패'); }
  };

  const handleEdit = async () => {
    if (!currentAccount) return;
    try {
      const values = await form.validateFields();
      await apiClient.put(`bank-account/${currentAccount.id}`, values);
      message.success('수정 성공');
      setIsModalVisible(false);
      getData();
    } catch (e) { message.error('수정 실패'); }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '삭제하시겠습니까?',
      onOk: async () => {
        try {
          await apiClient.delete(`bank-account/${id}`);
          message.success('삭제 성공');
          getData();
        } catch (e) {
          message.error('삭제 실패');
        }
      }
    });
  };

  const handleTableChange = (
      pagination: TablePaginationConfig,
      filters: Record<string, any>,
      sorter: any
  ) => {
    const order = sorter.field ? (sorter.order === 'ascend' ? sorter.field : `-${sorter.field}`) : 'bank';
    getData(pagination.current || 1, pagination.pageSize || 10, order, filters);
  };

  return (
      <div>
        <Content style={{ padding: '24px' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={() => getData(pagination.current, pagination.pageSize)}>새로고침</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>추가</Button>
                <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                  <Button icon={<EyeOutlined />}>필드 보기</Button>
                </Dropdown>
              </Space>
            </div>
            <Table
                dataSource={result}
                columns={columns}
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                rowKey="id"
                scroll={{ x: 'max-content' }}
            />
          </Card>
        </Content>

        <Modal title="계좌번호 추가" open={isAddModalVisible} onOk={handleAdd} onCancel={() => setIsAddModalVisible(false)}>
          <Form form={form} layout="vertical">
            <Form.Item name="bank" label="은행" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="account" label="계좌번호" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="account_holder" label="예금주" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="description" label="설명"><Input.TextArea /></Form.Item>
          </Form>
        </Modal>

        <Modal title="계좌번호 편집" open={isModalVisible} onOk={handleEdit} onCancel={() => setIsModalVisible(false)}>
          <Form form={form} layout="vertical">
            <Form.Item name="bank" label="은행" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="account" label="계좌번호" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="account_holder" label="예금주" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="description" label="설명"><Input.TextArea /></Form.Item>
          </Form>
        </Modal>
      </div>
  );
}

export default BankAccount;