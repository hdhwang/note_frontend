import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Button, Input, message, Modal, Form, Select, Space } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import '../App.css';
import apiClient from './api/api_client';
const { Content } = Layout;
const { Option } = Select;

function GuestBook() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [currentGuest, setCurrentGuest] = useState(null);
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
      title: '이름',
      dataIndex: 'name',
      key: 'name',
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
            검색
          </Button>
          <Button onClick={clearFilters} style={{ width: '100%', marginTop: 8 }}>
            초기화
          </Button>
        </div>
      ),
      onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '금액',
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      sorter: true,
      render: (text) => new Intl.NumberFormat().format(text),
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
      onFilter: (value, record) => record.amount.toString().includes(value),
    },
    {
      title: '일자',
      dataIndex: 'date',
      key: 'date',
      align: 'center',
      sorter: true,
    },
    {
      title: '장소',
      dataIndex: 'area',
      key: 'area',
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
      onFilter: (value, record) => record.area.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '참석 여부',
      dataIndex: 'attend',
      key: 'attend',
      align: 'center',
      sorter: true,
      filters: [
        { text: '참석', value: 'Y' },
        { text: '미참석', value: 'N' },
        { text: '미정', value: '-' },
      ],
      onFilter: (value, record) => record.attend === value,
      render: (text) => {
        if (text === 'Y') return '참석';
        if (text === 'N') return '미참석';
        return '미정';
      },
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
  ];

  const getData = async (page = 1, pageSize = 10, ordering = 'name', filters = {}) => {
    setLoading(true);
    try {
      const params = {
        page: page,
        page_size: pageSize,
        ordering: ordering,
        ...filters,
      };
      const response = await apiClient.get('guest-book', { params });
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
      title: '선택한 결혼식 방명록을 삭제 하시겠습니까?',
      okText: '확인',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          await apiClient.delete(`guest-book/${id}`);
          message.success('결혼식 방명록 삭제에 성공하였습니다.');
          getData(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error('결혼식 방명록 삭제에 실패하였습니다.');
        }
      },
    });
  };

  const showEditModal = (guest) => {
    setCurrentGuest(guest);
    form.setFieldsValue(guest);
    setIsModalVisible(true);
  };

  const handleEdit = async () => {
    try {
      const values = await form.validateFields();
      await apiClient.put(`guest-book/${currentGuest.id}`, values);
      message.success('결혼식 방명록 편집에 성공하였습니다.');
      setIsModalVisible(false);
      getData(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('결혼식 방명록 편집에 실패하였습니다.');
    }
  };

  const showAddModal = () => {
    form.resetFields();
    setIsAddModalVisible(true);
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      await apiClient.post('guest-book', values);
      message.success('결혼식 방명록 추가에 성공하였습니다.');
      setIsAddModalVisible(false);
      getData(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('결혼식 방명록 추가에 실패하였습니다.');
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    const sortField = sorter.field;
    const sortOrder = sorter.order === 'ascend' ? '' : '-';
    const order = sortField ? sortOrder + sortField : 'name';
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
        title="결혼식 방명록 추가"
        open={isAddModalVisible}
        onOk={handleAdd}
        onCancel={() => setIsAddModalVisible(false)}
        okText="확인"
        cancelText="취소"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="이름" rules={[{ required: true, message: '이름을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="amount" label="금액">
            <Input />
          </Form.Item>
          <Form.Item
            name="date"
            label="일자"
            rules={[
              {
                pattern: /^\d{4}-\d{2}-\d{2}$/,
                message: '날짜 형식은 YYYY-MM-DD이어야 합니다.',
              },
            ]}
          >
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="area" label="장소">
            <Input />
          </Form.Item>
          <Form.Item name="attend" label="참석 여부" rules={[{ required: true, message: '참석 여부를 선택하세요' }]}>
            <Select>
              <Option value="Y">참석</Option>
              <Option value="N">미참석</Option>
              <Option value="-">미정</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="설명">
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 10 }} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="결혼식 방명록 편집"
        open={isModalVisible}
        onOk={handleEdit}
        onCancel={() => setIsModalVisible(false)}
        okText="확인"
        cancelText="취소"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="이름" rules={[{ required: true, message: '이름을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="amount" label="금액">
            <Input />
          </Form.Item>
          <Form.Item
            name="date"
            label="일자"
            rules={[
              {
                pattern: /^\d{4}-\d{2}-\d{2}$/,
                message: '날짜 형식은 YYYY-MM-DD이어야 합니다.',
              },
            ]}
          >
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="area" label="장소">
            <Input />
          </Form.Item>
          <Form.Item name="attend" label="참석 여부" rules={[{ required: true, message: '참석 여부를 선택하세요' }]}>
            <Select>
              <Option value="Y">참석</Option>
              <Option value="N">미참석</Option>
              <Option value="-">미정</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="설명">
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 10 }} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default GuestBook;