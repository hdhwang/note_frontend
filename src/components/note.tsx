import React, { useState, useEffect } from 'react';
import { useSettings } from './settings_context';
import { Layout, Table, Button, Input, message, Modal, Checkbox, Form, Space, Dropdown, Descriptions } from "antd";
import { SmartTable } from "./SmartTable";
import type { MenuProps, TablePaginationConfig } from 'antd';
import '../App.css';
import apiClient from './api/api_client';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, EyeOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Content } = Layout;

// 1. 데이터 구조 인터페이스 정의
interface NoteData {
  id: number;
  title: string;
  note: string;
  date: string;
}

const Note: React.FC = () => {
  const { settings } = useSettings();
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<NoteData[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [visibleColumns, setVisibleColumns] = useState({
    title: true,
    note: false,
    date: true,
    actions: true,
  });
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [currentNote, setCurrentNote] = useState<NoteData | null>(null);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, record: NoteData | null }>({ visible: false, x: 0, y: 0, record: null });
  const [form] = Form.useForm();

  const columnLabels: Record<string, string> = {
    title: '제목',
    note: '내용',
    date: '등록 일자',
    actions: '작업',
  };

  const handleColumnVisibilityChange = (columnKey: string) => {
    setVisibleColumns(prevState => ({
      ...prevState,
      [columnKey as keyof typeof visibleColumns]: !prevState[columnKey as keyof typeof visibleColumns],
    }));
  };

  // 필드 설정 드롭다운 메뉴 아이템 구성
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

  const columns = [
    {
      title: '번호',
      dataIndex: 'index',
      key: 'index',
      open: true,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
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
              <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>
                확인
              </Button>
              <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>
                초기화
              </Button>
            </Space>
          </div>
      ),
      onFilter: (value: any, record: NoteData) => record.title.indexOf(value as string) === 0,
      open: visibleColumns.title,
    },
    {
      title: '내용',
      dataIndex: 'note',
      key: 'note',
      align: 'center' as const,
      open: visibleColumns.note,
    },
    {
      title: '등록 일자',
      dataIndex: 'date',
      key: 'date',
      align: 'center' as const,
      sorter: true,
      open: visibleColumns.date,
    },
    {
      title: '작업',
      key: 'actions',
      align: 'center' as const,
      render: (_: any, record: NoteData) => (
          <Space size={2}>
            <Button type="text" icon={<InfoCircleOutlined />} onClick={(e) => { e.stopPropagation(); showDetail(record); }} />
            <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); showEditModal(record); }} />
            <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }} />
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
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

  const showDetail = (note: NoteData) => {
    setCurrentNote(note);
    setIsDetailModalVisible(true);
  };

  const showEditModal = (note: NoteData) => {
    setCurrentNote(note);
    form.setFieldsValue(note);
    setIsModalVisible(true);
  };

  const handleEdit = async () => {
    if (!currentNote) return;
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

  const handleTableChange = (
      pagination: TablePaginationConfig,
      filters: Record<string, any>,
      sorter: any
  ) => {
    const sortField = sorter.field;
    const sortOrder = sorter.order === 'ascend' ? '' : '-';
    const order = sortField ? sortOrder + sortField : '-date';
    getData(pagination.current, pagination.pageSize, order, filters);
  };

  return (
      <div>
        <Content style={{ padding: '24px' }}>
          <div style={{ width: "100%" }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, flexWrap: 'wrap', gap: '8px 0' }}>
              <Space wrap>
                <Button className="responsive-icon-btn" icon={<ReloadOutlined />} onClick={() => getData(pagination.current, pagination.pageSize)}>
                  새로고침
                </Button>
                <Button className="responsive-icon-btn" icon={<PlusOutlined />} onClick={showAddModal}>
                  추가
                </Button>
                <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                  <Button className="responsive-icon-btn" icon={<EyeOutlined />}>
                    필드 보기
                  </Button>
                </Dropdown>
              </Space>
            </div>

            <SmartTable tableId="note_table"
                size={settings.tableDensity}
                dataSource={result}
                columns={columns}
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                rowKey="id"
                scroll={{ x: 'max-content' }}
                onRow={(record: NoteData) => ({
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

        <Modal title="노트 상세" open={isDetailModalVisible} onCancel={() => setIsDetailModalVisible(false)} footer={[<Button key="close" onClick={() => setIsDetailModalVisible(false)}>닫기</Button>]}>
            {currentNote && (
                <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="제목">{currentNote.title}</Descriptions.Item>
                    <Descriptions.Item label="등록 일자">{currentNote.date}</Descriptions.Item>
                    <Descriptions.Item label="내용"><pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{currentNote.note}</pre></Descriptions.Item>
                </Descriptions>
            )}
        </Modal>
      </div>
  );
}

export default Note;