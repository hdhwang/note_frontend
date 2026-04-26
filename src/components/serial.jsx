import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Button, Input, message, Modal, Form, Select, Space, Checkbox, Dropdown } from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, EyeOutlined} from "@ant-design/icons";
import '../App.css';
import apiClient from './api/api_client';

const { Content } = Layout;
const { Option } = Select;

function Serial({ collapsed }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [visibleColumns, setVisibleColumns] = useState({
    type: true,
    title: true,
    value: true,
    description: true,
    actions: true,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [currentSerial, setCurrentSerial] = useState(null);
  const [form] = Form.useForm();

  const columnLabels = {
    type: '유형',
    title: '제품 명',
    value: '시리얼 번호',
    description: '설명',
    actions: '작업',
  };

  const handleColumnVisibilityChange = (columnKey) => {
    setVisibleColumns(prevState => ({
      ...prevState,
      [columnKey]: !prevState[columnKey],
    }));
  };

  // 필드 설정 드롭다운 메뉴 아이템 구성
  const menuItems = Object.keys(columnLabels).map(columnKey => ({
    key: columnKey,
    label: (
        <Checkbox
            checked={visibleColumns[columnKey]}
            onChange={() => handleColumnVisibilityChange(columnKey)}
            onClick={(e) => e.stopPropagation()} // 클릭 시 드롭다운 닫힘 방지
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
      title: '유형',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      sorter: true,
      filters: [
        { text: '게임', value: '게임' },
        { text: '운영체제', value: '운영체제' },
        { text: '유틸', value: '유틸' },
      ],
      filterMultiple: false,
      onFilter: (value, record) => record.type,
      open: visibleColumns.type,
    },
    {
      title: '제품 명',
      dataIndex: 'title',
      key: 'title',
      align: 'center',
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
                value={selectedKeys[0]}
                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={confirm}
                style={{ marginBottom: 8, display: 'block' }}
            />
            <Button type="primary" onClick={confirm} size="small" style={{ width: 90, marginRight: 8 }}>
              확인
            </Button>
            <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
              초기화
            </Button>
          </div>
      ),
      onFilter: (value, record) => record.title,
      open: visibleColumns.title,
    },
    {
      title: '시리얼 번호',
      dataIndex: 'value',
      key: 'value',
      align: 'center',
      sorter: true,
      open: visibleColumns.value,
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
      sorter: true,
      open: visibleColumns.description,
    },
    {
      title: '작업',
      key: 'actions',
      align: 'center',
      open: visibleColumns.actions,
      render: (text, record) => (
          <Space>
            <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => showEditModal(record)}
            />
            <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
            />
          </Space>
      ),
    },
  ].filter(column => column.open);

  const getData = async (page = 1, pageSize = 10, ordering = 'title', filters = {}) => {
    setLoading(true);
    try {
      const params = {
        page: page,
        page_size: pageSize,
        ordering: ordering,
        ...filters,
      };
      const response = await apiClient.get('serial', { params });
      setResult(response.data.results);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: response.data.count,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '선택한 시리얼 번호를 삭제 하시겠습니까?',
      okType: 'danger',
      onOk: async () => {
        try {
          await apiClient.delete(`serial/${id}`);
          message.success('삭제 성공');
          getData(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error('삭제 실패');
        }
      },
    });
  };

  const showEditModal = (serial) => {
    setCurrentSerial(serial);
    form.setFieldsValue(serial);
    setIsModalVisible(true);
  };

  const handleEdit = async () => {
    try {
      const values = await form.validateFields();
      await apiClient.put(`serial/${currentSerial.id}`, values);
      message.success('수정 성공');
      setIsModalVisible(false);
      getData(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('수정 실패');
    }
  };

  const showAddModal = () => {
    form.resetFields();
    setIsAddModalVisible(true);
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      await apiClient.post('serial', values);
      message.success('추가 성공');
      setIsAddModalVisible(false);
      getData();
    } catch (error) {
      message.error('추가 실패');
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    const order = sorter.field ? (sorter.order === 'ascend' ? sorter.field : `-${sorter.field}`) : 'title';
    getData(pagination.current, pagination.pageSize, order, filters);
  };

  return (
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Content style={{ padding: '24px' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={() => getData(pagination.current, pagination.pageSize)}>
                  새로고침
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                  추가
                </Button>
                {/* 필드 보기 드롭다운 추가 */}
                <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                  <Button icon={<EyeOutlined />}>
                    필드 보기
                  </Button>
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

        {/* 추가 모달 */}
        <Modal title="시리얼 번호 추가" open={isAddModalVisible} onOk={handleAdd} onCancel={() => setIsAddModalVisible(false)}>
          <Form form={form} layout="vertical">
            <Form.Item name="type" label="유형" rules={[{ required: true }]}>
              <Select>
                <Option value="게임">게임</Option>
                <Option value="운영체제">운영체제</Option>
                <Option value="유틸">유틸</Option>
              </Select>
            </Form.Item>
            <Form.Item name="title" label="제품 명" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="value" label="시리얼 번호" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="description" label="설명"><Input.TextArea autoSize={{ minRows: 2 }} /></Form.Item>
          </Form>
        </Modal>

        {/* 편집 모달 */}
        <Modal title="시리얼 번호 편집" open={isModalVisible} onOk={handleEdit} onCancel={() => setIsModalVisible(false)}>
          <Form form={form} layout="vertical">
            <Form.Item name="type" label="유형" rules={[{ required: true }]}>
              <Select>
                <Option value="게임">게임</Option>
                <Option value="운영체제">운영체제</Option>
                <Option value="유틸">유틸</Option>
              </Select>
            </Form.Item>
            <Form.Item name="title" label="제품 명" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="value" label="시리얼 번호" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="description" label="설명"><Input.TextArea autoSize={{ minRows: 2 }} /></Form.Item>
          </Form>
        </Modal>
      </Layout>
  );
}

export default Serial;