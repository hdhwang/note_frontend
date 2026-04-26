import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Button, Input, message, Modal, Form, Space, Checkbox, Dropdown } from "antd";
import '../App.css';
import apiClient from './api/api_client';
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, EyeOutlined} from "@ant-design/icons";

const { Content } = Layout;

function BankAccount({ collapsed }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [visibleColumns, setVisibleColumns] = useState({
    bank: true,
    account: true,
    account_holder: true,
    description: true,
    actions: true,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [form] = Form.useForm();

  const columnLabels = {
    bank: '은행',
    account: '계좌번호',
    account_holder: '예금주',
    description: '설명',
    actions: '작업',
  };

  const handleColumnVisibilityChange = (columnKey) => {
    setVisibleColumns(prevState => ({
      ...prevState,
      [columnKey]: !prevState[columnKey],
    }));
  };

  // [수정된 부분] Dropdown의 menu 속성에 들어갈 아이템 구성
  const menuItems = Object.keys(columnLabels).map(columnKey => ({
    key: columnKey,
    label: (
        <Checkbox
            checked={visibleColumns[columnKey]}
            onChange={() => handleColumnVisibilityChange(columnKey)}
            onClick={(e) => e.stopPropagation()} // 클릭 시 메뉴 닫힘 방지
        >
          {columnLabels[columnKey]}
        </Checkbox>
    ),
  }));

  const columns = [
    {
      title: '번호',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: '은행',
      dataIndex: 'bank',
      key: 'bank',
      align: 'center',
      sorter: true,
      open: visibleColumns.bank,
    },
    {
      title: '계좌번호',
      dataIndex: 'account',
      key: 'account',
      align: 'center',
      open: visibleColumns.account,
    },
    {
      title: '예금주',
      dataIndex: 'account_holder',
      key: 'account_holder',
      align: 'center',
      sorter: true,
      open: visibleColumns.account_holder,
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
      open: visibleColumns.description,
    },
    {
      title: '작업',
      key: 'actions',
      align: 'center',
      open: visibleColumns.actions,
      render: (text, record) => (
          <Space>
            <Button type="primary" icon={<EditOutlined />} onClick={() => showEditModal(record)} />
            <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Space>
      ),
    },
  ].filter(column => column.open);

  // 데이터 로딩 로직 (동일)
  const getData = async (page = 1, pageSize = 10, ordering = 'bank', filters = {}) => {
    setLoading(true);
    try {
      const params = { page, page_size: pageSize, ordering, ...filters };
      const response = await apiClient.get('bank-account', { params });
      setResult(response.data.results);
      setPagination({ current: page, pageSize, total: response.data.count });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getData(); }, []);

  const showEditModal = (account) => { setCurrentAccount(account); form.setFieldsValue(account); setIsModalVisible(true); };
  const showAddModal = () => { form.resetFields(); setIsAddModalVisible(true); };

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
    try {
      const values = await form.validateFields();
      await apiClient.put(`bank-account/${currentAccount.id}`, values);
      message.success('수정 성공');
      setIsModalVisible(false);
      getData();
    } catch (e) { message.error('수정 실패'); }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '삭제하시겠습니까?',
      onOk: async () => {
        await apiClient.delete(`bank-account/${id}`);
        getData();
      }
    });
  };

  const handleTableChange = (p, f, s) => {
    const order = s.field ? (s.order === 'ascend' ? s.field : `-${s.field}`) : 'bank';
    getData(p.current, p.pageSize, order, f);
  };

  return (
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Content style={{ padding: '24px' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={() => getData(pagination.current, pagination.pageSize)}>새로고침</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>추가</Button>
                {/* [수정된 부분] Dropdown 설정 */}
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
            />
          </Card>
        </Content>

        {/* 모달 생략 (동일) */}
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
      </Layout>
  );
}

export default BankAccount;