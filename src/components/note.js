import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Button, Input, message, Modal, Checkbox, Form, Space } from "antd";
import '../App.css';
import apiClient from './api/api_client';
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
const { Content } = Layout;

function Note({collapsed}) {
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

  const columns = [
    {
      title: '번호',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
      open: true,
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
          <Button type="primary" onClick={confirm} style={{ width: '100%' }}>
            확인
          </Button>
          <Button onClick={clearFilters} style={{ width: '100%', marginTop: 8 }}>
            초기화
          </Button>
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
    const filterParams = Object.keys(filters).reduce((acc, key) => {
      if (filters[key]){
        if (Array.isArray(filters[key])) {
          acc[key] = filters[key].join(',');
        } else {
          acc[key] = filters[key];
        }
      }
      return acc;
    }, {});
    try {
      const params = {
        page: page,
        page_size: pageSize,
        ordering: ordering,
        ...filterParams,
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

  const handleColumnVisibilityChange = (columnKey) => {
    setVisibleColumns(prevState => ({
      ...prevState,
      [columnKey]: !prevState[columnKey],
    }));
  };

  return (
    <Layout style={{ marginLeft: collapsed ? 80 : 200 }}>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', marginBottom: 16 }}>
              <Button onClick={() => getData(pagination.current, pagination.pageSize)} style={{ marginRight: 8 }}>
                새로고침
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                추가
              </Button>
            </div>
            <div style={{ marginBottom: 16 }}>
              {Object.keys(visibleColumns).map(columnKey => (
                <Checkbox
                  key={columnKey}
                  checked={visibleColumns[columnKey]}
                  onChange={() => handleColumnVisibilityChange(columnKey)}
                >
                  {columnLabels[columnKey]}
                </Checkbox>
              ))}
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
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </div>
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