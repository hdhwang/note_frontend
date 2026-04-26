import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Button, Input, message, Modal, Form, Select, Space, Checkbox, Dropdown } from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, EyeOutlined} from "@ant-design/icons";
import '../App.css';
import apiClient from './api/api_client';

const { Content } = Layout;
const { Option } = Select;

function GuestBook({ collapsed }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    amount: true,
    date: true,
    area: true,
    attend: true,
    description: true,
    actions: true,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [currentGuest, setCurrentGuest] = useState(null);
  const [form] = Form.useForm();

  const columnLabels = {
    name: '이름',
    amount: '금액',
    date: '일자',
    area: '장소',
    attend: '참석 여부',
    description: '설명',
    actions: '작업',
  };

  const handleColumnVisibilityChange = (columnKey) => {
    setVisibleColumns(prevState => ({
      ...prevState,
      [columnKey]: !prevState[columnKey],
    }));
  };

  // 필드 설정 드롭다운 메뉴 구성
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
            <Space>
              <Button type="primary" onClick={confirm} size="small" style={{ width: 90 }}>확인</Button>
              <Button onClick={clearFilters} size="small" style={{ width: 90 }}>초기화</Button>
            </Space>
          </div>
      ),
      onFilter: (value, record) => record.name,
      open: visibleColumns.name,
    },
    {
      title: '금액',
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      sorter: true,
      render: (text) => new Intl.NumberFormat().format(text),
      open: visibleColumns.amount,
    },
    {
      title: '일자',
      dataIndex: 'date',
      key: 'date',
      align: 'center',
      sorter: true,
      open: visibleColumns.date,
    },
    {
      title: '장소',
      dataIndex: 'area',
      key: 'area',
      align: 'center',
      sorter: true,
      open: visibleColumns.area,
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
        { text: '- (미정)', value: '-' },
      ],
      filterMultiple: false,
      onFilter: (value, record) => record.attend,
      render: (text) => {
        if (text === 'Y') return '참석';
        if (text === 'N') return '미참석';
        return '미정';
      },
      open: visibleColumns.attend,
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
      render: (text, record) => (
          <Space>
            <Button type="primary" icon={<EditOutlined />} onClick={() => showEditModal(record)} />
            <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Space>
      ),
      open: visibleColumns.actions,
    },
  ].filter(column => column.open);

  const getData = async (page = 1, pageSize = 10, ordering = 'name', filters = {}) => {
    setLoading(true);
    try {
      const params = { page, page_size: pageSize, ordering, ...filters };
      const response = await apiClient.get('guest-book', { params });
      setResult(response.data.results);
      setPagination({ current: page, pageSize, total: response.data.count });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '삭제하시겠습니까?',
      okType: 'danger',
      onOk: async () => {
        try {
          await apiClient.delete(`guest-book/${id}`);
          message.success('삭제되었습니다.');
          getData(pagination.current, pagination.pageSize);
        } catch (e) { message.error('삭제 실패'); }
      },
    });
  };

  const showEditModal = (guest) => {
    setCurrentGuest(guest);
    form.setFieldsValue(guest);
    setIsModalVisible(true);
  };

  const showAddModal = () => {
    form.resetFields();
    setIsAddModalVisible(true);
  };

  const handleAddOrEdit = async (mode) => {
    try {
      const values = await form.validateFields();
      if (mode === 'add') {
        await apiClient.post('guest-book', values);
        message.success('추가되었습니다.');
        setIsAddModalVisible(false);
      } else {
        await apiClient.put(`guest-book/${currentGuest.id}`, values);
        message.success('수정되었습니다.');
        setIsModalVisible(false);
      }
      getData(pagination.current, pagination.pageSize);
    } catch (e) { message.error('작업에 실패했습니다.'); }
  };

  useEffect(() => { getData(); }, []);

  const handleTableChange = (p, f, s) => {
    const order = s.field ? (s.order === 'ascend' ? s.field : `-${s.field}`) : 'name';
    getData(p.current, p.pageSize, order, f);
  };

  return (
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
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

        {/* 추가/편집 모달 재사용 구조 (내용은 동일) */}
        {[
          { title: "추가", visible: isAddModalVisible, setVisible: setIsAddModalVisible, onOk: () => handleAddOrEdit('add') },
          { title: "편집", visible: isModalVisible, setVisible: setIsModalVisible, onOk: () => handleAddOrEdit('edit') }
        ].map(modal => (
            <Modal
                key={modal.title}
                title={`결혼식 방명록 ${modal.title}`}
                open={modal.visible}
                onOk={modal.onOk}
                onCancel={() => modal.setVisible(false)}
            >
              <Form form={form} layout="vertical">
                <Form.Item name="name" label="이름" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="amount" label="금액"><Input type="number" /></Form.Item>
                <Form.Item name="date" label="일자" rules={[{ pattern: /^\d{4}-\d{2}-\d{2}$/, message: 'YYYY-MM-DD 형식' }]}>
                  <Input placeholder="YYYY-MM-DD" />
                </Form.Item>
                <Form.Item name="area" label="장소"><Input /></Form.Item>
                <Form.Item name="attend" label="참석 여부" rules={[{ required: true }]}>
                  <Select>
                    <Option value="Y">참석</Option>
                    <Option value="N">미참석</Option>
                    <Option value="-">미정</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="description" label="설명"><Input.TextArea autoSize={{ minRows: 2 }} /></Form.Item>
              </Form>
            </Modal>
        ))}
      </Layout>
  );
}

export default GuestBook;