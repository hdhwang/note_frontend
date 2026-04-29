import React, { useState, useEffect } from 'react';
import { useSettings } from './settings_context';
import { Layout, Table, Button, Input, message, Modal, Checkbox, Form, Space, Dropdown, Descriptions, Row, Col } from "antd";
import { SmartTable } from "./SmartTable";
import { useQuery } from '@tanstack/react-query';
import { useUrlQueryParams } from '../hooks/useUrlQueryParams';
import type { MenuProps, TablePaginationConfig } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import '../App.css';
import apiClient from './api/api_client';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, EyeOutlined, InfoCircleOutlined, DownloadOutlined } from "@ant-design/icons";


const { Content } = Layout;

// 1. 데이터 구조 인터페이스 정의
interface NoteData {
  id: number;
  title: string;
  note: string;
  created_at: string;
}

const Note: React.FC = () => {
  const { settings } = useSettings();
  const [queryParams, setQueryParams] = useUrlQueryParams('-created_at');

  const { data, isFetching, refetch, dataUpdatedAt } = useQuery({
      queryKey: ['note', queryParams],
      queryFn: async () => {
          const params = { page: queryParams.page, page_size: queryParams.pageSize, ordering: queryParams.ordering, ...queryParams.filters };
          const response = await apiClient.get('note', { params });
          return response.data;
      }
  });

  const loading = isFetching;
  const result = data?.results || [];
  const pagination = { current: queryParams.page, pageSize: queryParams.pageSize, total: data?.count || 0 };
  const [visibleColumns, setVisibleColumns] = useState({
    title: true,
    created_at: true,
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
    created_at: '생성 일자',
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

  const allColumns: ColumnType<NoteData>[] = [
    {
      title: '번호',
      dataIndex: 'index',
      key: 'index',
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
    },

    {
      title: '생성 일자',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center' as const,
      sorter: true,
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
  ) as ColumnsType<NoteData>;

  const getData = (page = queryParams.page, pageSize = queryParams.pageSize, ordering = queryParams.ordering, filters = queryParams.filters) => {
      setQueryParams({ page, pageSize, ordering, filters });
      if (page === queryParams.page && pageSize === queryParams.pageSize && ordering === queryParams.ordering && JSON.stringify(filters) === JSON.stringify(queryParams.filters)) {
          refetch();
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

  const handleTableChange = (
      pagination: TablePaginationConfig,
      filters: Record<string, any>,
      sorter: any
  ) => {
    const sortField = sorter.field;
    const sortOrder = sorter.order === 'ascend' ? '' : '-';
    const order = sortField ? sortOrder + sortField : '-created_at';
    getData(pagination.current, pagination.pageSize, order, filters);
  };

  const handleExport = async () => {
    const hide = message.loading('내보내기를 진행 중입니다.', 0);
    try {
      const params = { ordering: queryParams.ordering, ...queryParams.filters };
      const response = await apiClient.get('note/export', { 
        params, 
        responseType: 'blob' 
      });
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = '노트 관리.zip';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        if (filenameMatch && filenameMatch.length === 2) filename = decodeURIComponent(filenameMatch[1]);
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      message.success('내보내기가 완료되었습니다.');
    } catch (e) {
      console.error(e);
      message.error('내보내기가 실패하였습니다.');
    } finally {
      hide();
    }
  };


  return (
      <div>
        <Content className="main-content">
          <div style={{ width: "100%" }}>
            <Row gutter={[12, 12]} align="middle" justify="space-between" style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12}>
                {/* 왼쪽 영역 (필요시 검색창 등 추가 가능) */}
              </Col>
              <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
                <Space wrap>
                  <Button className="responsive-icon-btn" icon={<ReloadOutlined />} onClick={() => getData(pagination.current, pagination.pageSize)}>
                    새로고침
                  </Button>
                  <Button className="responsive-icon-btn" icon={<DownloadOutlined />} onClick={handleExport}>
                    내보내기
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
              </Col>
            </Row>

            <div className="table-container">

            <SmartTable tableId="note_table"
                lastRefreshed={dataUpdatedAt}
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
                    <li style={{ padding: '8px 16px', cursor: 'pointer' }} onClick={() => { handleExport(); setContextMenu(prev => ({...prev, visible: false})); }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <DownloadOutlined style={{ marginRight: 8 }} /> 내보내기
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
                    <Descriptions.Item label="생성 일자">{currentNote.created_at || '-'}</Descriptions.Item>
                    <Descriptions.Item label="내용"><pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{currentNote.note}</pre></Descriptions.Item>
                </Descriptions>
            )}
        </Modal>
      </div>
  );
}

export default Note;