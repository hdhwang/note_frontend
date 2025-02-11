import React, { useState, useEffect } from 'react';
import {Layout, Card, Table, Button, Input, message, Modal, Form, Select} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import '../App.css';
import apiClient from './api/api_client';
const { Content } = Layout;
const { Option } = Select;

function Serial() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [currentSerial, setCurrentSerial] = useState(null);
  const [form] = Form.useForm();

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
      onFilter: (value, record) => record.type.includes(value),
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
          <Button type="primary" onClick={confirm} style={{ width: '100%' }}>
            Search
          </Button>
          <Button onClick={clearFilters} style={{ width: '100%', marginTop: 8 }}>
            Reset
          </Button>
        </div>
      ),
      onFilter: (value, record) => record.title.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '시리얼 번호',
      dataIndex: 'value',
      key: 'value',
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
          <Button type="primary" onClick={confirm} style={{ width: '100%' }}>
            Search
          </Button>
          <Button onClick={clearFilters} style={{ width: '100%', marginTop: 8 }}>
            Reset
          </Button>
        </div>
      ),
      onFilter: (value, record) => record.value.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
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
          <Button type="primary" onClick={confirm} style={{ width: '100%' }}>
            Search
          </Button>
          <Button onClick={clearFilters} style={{ width: '100%', marginTop: 8 }}>
            Reset
          </Button>
        </div>
      ),
      onFilter: (value, record) => record.description.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '작업',
      key: 'actions',
      align: 'center',
      render: (text, record) => (
        <div>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </div>
      ),
    },
  ];

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
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '선택한 시리얼 번호를 삭제 하시겠습니까?',
      okText: '확인',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          await apiClient.delete(`serial/${id}`);
          message.success('시리얼 번호 삭제에 성공하였습니다.');
          getData(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error('시리얼 번호 삭제에 실패하였습니다.');
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
      message.success('시리얼 번호 편집에 성공하였습니다.');
      setIsModalVisible(false);
      getData(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('시리얼 번호 편집에 실패하였습니다.');
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
      message.success('시리얼 번호 추가에 성공하였습니다.');
      setIsAddModalVisible(false);
      getData(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('시리얼 번호 추가에 실패하였습니다.');
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    const sortField = sorter.field || 'title';
    const sortOrder = sorter.order === 'ascend' ? '' : '-';
    const order = sortOrder + sortField;
    setFilters(filters);
    getData(pagination.current, pagination.pageSize, order, filters);
  };

  return (
    <Layout style={{ marginLeft: 200 }}>
      <Content style={{ overflow: 'initial' }}>
        <div style={{
          textAlign: 'left',
          maxHeight: '100%',
          maxWidth: '100%',
          display: 'inline',
          flexDirection: 'column',
          justifyContent: 'left',
          color: '#131629',
        }}>
          <Card style={{ padding: '0px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <Button onClick={() => getData(pagination.current, pagination.pageSize)} style={{ marginRight: 8 }}>
                새로고침
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                추가
              </Button>
            </div>
            <Table
              dataSource={result}
              columns={columns}
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
              }}
              onChange={handleTableChange}
              rowKey="id"
            />
          </Card>
        </div>
      </Content>
      <Modal
        title="시리얼 번호 추가"
        open={isAddModalVisible}
        onOk={handleAdd}
        onCancel={() => setIsAddModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="유형" rules={[{ required: true, message: '유형을 선택하세요' }]}>
            <Select>
              <Option value="게임">게임</Option>
              <Option value="운영체제">운영체제</Option>
              <Option value="유틸">유틸</Option>
            </Select>
          </Form.Item>
          <Form.Item name="title" label="제품 명" rules={[{ required: true, message: '제품 명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="value" label="시리얼 번호" rules={[{ required: true, message: '시리얼 번호를 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="설명">
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 10 }} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="시리얼 번호 편집"
        open={isModalVisible}
        onOk={handleEdit}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="유형" rules={[{ required: true, message: '유형을 선택하세요' }]}>
            <Select>
              <Option value="게임">게임</Option>
              <Option value="운영체제">운영체제</Option>
              <Option value="유틸">유틸</Option>
            </Select>
          </Form.Item>
          <Form.Item name="title" label="제품 명" rules={[{ required: true, message: '제품 명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="value" label="시리얼 번호" rules={[{ required: true, message: '시리얼 번호를 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="설명">
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 10 }} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default Serial;