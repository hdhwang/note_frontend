import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Button, Input, message, Modal, Checkbox, Form, Space, Dropdown } from "antd";
import '../App.css';
import apiClient from './api/api_client';
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, EyeOutlined} from "@ant-design/icons";

const { Content } = Layout;

function Note({ collapsed }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [visibleColumns, setVisibleColumns] = useState({
    title: true,
    note: false,
    date: true,
    actions: true,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [form] = Form.useForm();

  const columnLabels = {
    title: '제목',
    note: '내용',
    date: '등록 일자',
    actions: '작업',
  };

  const handleColumnVisibilityChange = (columnKey) => {
    setVisibleColumns(prevState => ({
      ...prevState,
      [columnKey]: !prevState[columnKey],
    }));
  };

  // 필드 보기 드롭다운 메뉴 아이템 구성
  const menuItems = Object.keys(columnLabels).map(columnKey => ({
    key: columnKey,
    label: (
        <Checkbox
            checked={visibleColumns[columnKey]}
            onChange={() => handleColumnVisibilityChange(columnKey)}
            onClick={(e) => e.stopPropagation()} // 메뉴 닫힘 방지
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
      title: '제목',
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
            <Space>
              <Button type="primary" onClick={confirm} size="small" style={{ width: 90 }}>
                확인
              </Button>
              <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
                초기화
              </Button>
            </Space>
          </div>
      ),
      onFilter: (value, record) => record.title,
      open: visibleColumns.title,
    },
    {
      title: '내용',
      dataIndex: 'note',
      key: 'note',
      align: 'center',
      open: visibleColumns.note,
    },
    {
      title: '등록 일자',
      dataIndex: 'date',
      key: 'date',
      align: 'center',
      sorter: true,
      open: visibleColumns.date,
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
      open: visibleColumns.actions,
    },
  ].filter(column => column.open);

  const getData = async (page = 1, pageSize = 10, ordering = '-date', filters = {}) => {
    setLoading(true);
    try {
      const params = {
        page: page,
        page_size: pageSize,
        ordering: ordering,
        ...filters,
      };
      const response = await apiClient.get('note', { params });
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
      title: '선택한 노트를 삭제 하시겠습니까?',
      okType: 'danger',
      onOk: async () => {
        try {
          await apiClient.delete(`note/${id}`);
          message.success('노트 삭제에 성공하였습니다.');
          getData(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error('노트 삭제에 실패하였습니다.');
        }
      },
    });
  };

  const showEditModal = (note) => {
    setCurrentNote(note);
    form.setFieldsValue(note);
    setIsModalVisible(true);
  };

  const handleEdit = async () => {
    try {
      const values = await form.validateFields();
      await apiClient.put(`note/${currentNote.id}`, values);
      message.success('노트 편집에 성공하였습니다.');
      setIsModalVisible(false);
      getData(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('노트 편집에 실패하였습니다.');
    }
  };

  const showAddModal = () => {
    form.resetFields();
    setIsAddModalVisible(true);
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      await apiClient.post('note', values);
      message.success('노트 추가에 성공하였습니다.');
      setIsAddModalVisible(false);
      getData(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('노트 추가에 실패하였습니다.');
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    const sortField = sorter.field;
    const sortOrder = sorter.order === 'ascend' ? '' : '-';
    const order = sortField ? sortOrder + sortField : '-date';
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

        <Modal
            title="노트 추가"
            open={isAddModalVisible}
            onOk={handleAdd}
            onCancel={() => setIsAddModalVisible(false)}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="title" label="제목" rules={[{ required: true, message: '제목을 입력하세요' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="note" label="내용">
              <Input.TextArea autoSize={{ minRows: 2, maxRows: 10 }}/>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
            title="노트 편집"
            open={isModalVisible}
            onOk={handleEdit}
            onCancel={() => setIsModalVisible(false)}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="title" label="제목" rules={[{ required: true, message: '제목을 입력하세요' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="note" label="내용" rules={[{ required: true, message: '내용을 입력하세요' }]}>
              <Input.TextArea autoSize={{ minRows: 2, maxRows: 10 }}/>
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
  );
}

export default Note;