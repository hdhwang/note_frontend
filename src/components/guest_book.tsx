import React, { useState, useEffect } from 'react';
import { useSettings } from './settings_context';
import { Layout, Table, Button, Input, message, Modal, Form, Select, Space, Checkbox, Dropdown, Descriptions, Tag } from 'antd';
import { SmartTable } from "./SmartTable";
import { useQuery } from '@tanstack/react-query';
import { useUrlQueryParams } from '../hooks/useUrlQueryParams';
import type { MenuProps, TablePaginationConfig } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, EyeOutlined, InfoCircleOutlined, DownloadOutlined } from "@ant-design/icons";

import '../App.css';
import apiClient from './api/api_client';

const { Content } = Layout;
const { Option } = Select;

// 1. 데이터 구조 인터페이스 정의
interface GuestBookData {
  id: number;
  name: string;
  amount: number;
  date: string;
  area: string;
  attend: 'Y' | 'N' | '-';
  description: string;
  created_at?: string;
}

const GuestBook: React.FC = () => {
  const { settings } = useSettings();
  const [queryParams, setQueryParams] = useUrlQueryParams('name');

  const { data, isFetching, refetch, dataUpdatedAt } = useQuery({
      queryKey: ['guest-book', queryParams],
      queryFn: async () => {
          const params = { page: queryParams.page, page_size: queryParams.pageSize, ordering: queryParams.ordering, ...queryParams.filters };
          const response = await apiClient.get('guest-book', { params });
          return response.data;
      }
  });

  const loading = isFetching;
  const result = data?.results || [];
  const pagination = { current: queryParams.page, pageSize: queryParams.pageSize, total: data?.count || 0 };
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    amount: true,
    date: true,
    area: true,
    attend: true,
    description: true,
    created_at: true,
    actions: true,
  });
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [currentGuest, setCurrentGuest] = useState<GuestBookData | null>(null);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, record: GuestBookData | null }>({ visible: false, x: 0, y: 0, record: null });
  const [form] = Form.useForm();

  const columnLabels: Record<string, string> = {
    name: '이름',
    amount: '금액',
    date: '일자',
    area: '장소',
    attend: '참석 여부',
    description: '설명',
    created_at: '생성 일자',
    actions: '작업',
  };

  const handleColumnVisibilityChange = (columnKey: string) => {
    setVisibleColumns(prevState => ({
      ...prevState,
      [columnKey as keyof typeof visibleColumns]: !prevState[columnKey as keyof typeof visibleColumns],
    }));
  };

  // 필드 설정 드롭다운 메뉴 구성
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
  const allColumns: ColumnType<GuestBookData>[] = [
    {
      title: '번호',
      dataIndex: 'index',
      key: 'index',
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
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
              <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>확인</Button>
              <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>초기화</Button>
            </Space>
          </div>
      ),
    },
    {
      title: '금액',
      dataIndex: 'amount',
      key: 'amount',
      align: 'center' as const,
      sorter: true,
      render: (text: number) => new Intl.NumberFormat().format(text),
    },
    {
      title: '일자',
      dataIndex: 'date',
      key: 'date',
      align: 'center' as const,
      sorter: true,
    },
    {
      title: '장소',
      dataIndex: 'area',
      key: 'area',
      align: 'center' as const,
      sorter: true,
    },
    {
      title: '참석 여부',
      dataIndex: 'attend',
      key: 'attend',
      align: 'center' as const,
      sorter: true,
      filters: [
        { text: '참석', value: 'Y' },
        { text: '미참석', value: 'N' },
        { text: '- (미정)', value: '-' },
      ],
      filterMultiple: false,
      render: (text: string) => {
        if (text === 'Y') return <Tag color="green">참석</Tag>;
        if (text === 'N') return <Tag color="volcano">미참석</Tag>;
        return <Tag color="default">미정</Tag>;
      },
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      align: 'center' as const,
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
      render: (_: any, record: GuestBookData) => (
          <Space size={2}>
            <Button type="text" icon={<InfoCircleOutlined />} onClick={(e) => { e.stopPropagation(); showDetail(record); }} />
            <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); showEditModal(record); }} />
            <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }} />
          </Space>
      ),
    },
  ];

  // 필터링된 컬럼 생성 및 정렬 상태 동기화
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
  ) as ColumnsType<GuestBookData>;

  const getData = (page = queryParams.page, pageSize = queryParams.pageSize, ordering = queryParams.ordering, filters = queryParams.filters) => {
      setQueryParams({ page, pageSize, ordering, filters });
      if (page === queryParams.page && pageSize === queryParams.pageSize && ordering === queryParams.ordering && JSON.stringify(filters) === JSON.stringify(queryParams.filters)) {
          refetch();
      }
  };

  const handleDelete = async (id: number) => {
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

  const showDetail = (guest: GuestBookData) => {
    setCurrentGuest(guest);
    setIsDetailModalVisible(true);
  };

  const showEditModal = (guest: GuestBookData) => {
    setCurrentGuest(guest);
    form.setFieldsValue(guest);
    setIsModalVisible(true);
  };

  const showAddModal = () => {
    form.resetFields();
    setIsAddModalVisible(true);
  };

  const handleAddOrEdit = async (mode: 'add' | 'edit') => {
    try {
      const values = await form.validateFields();
      if (mode === 'add') {
        await apiClient.post('guest-book', values);
        message.success('추가되었습니다.');
        setIsAddModalVisible(false);
      } else if (mode === 'edit' && currentGuest) {
        await apiClient.put(`guest-book/${currentGuest.id}`, values);
        message.success('수정되었습니다.');
        setIsModalVisible(false);
      }
      getData(pagination.current, pagination.pageSize);
    } catch (e) { message.error('작업에 실패했습니다.'); }
  };

  const handleTableChange = (
      p: TablePaginationConfig,
      f: Record<string, any>,
      s: any
  ) => {
    const order = s.field ? (s.order === 'ascend' ? s.field : `-${s.field}`) : 'name';
    getData(p.current || 1, p.pageSize || 10, order, f);
  };

  const handleExport = async () => {
    const hide = message.loading('내보내기를 진행 중입니다.', 0);
    try {
      const params = { ordering: queryParams.ordering, ...queryParams.filters };
      const response = await apiClient.get('guest-book/export', { 
        params, 
        responseType: 'blob' 
      });
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = '결혼식 방명록.zip';
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
        <Content style={{ padding: '24px' }}>
          <div style={{ width: "100%" }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, flexWrap: 'wrap', gap: '8px 0' }}>
              <Space wrap>
                <Button className="responsive-icon-btn" icon={<ReloadOutlined />} onClick={() => getData(pagination.current, pagination.pageSize)}>새로고침</Button>
                <Button className="responsive-icon-btn" icon={<DownloadOutlined />} onClick={handleExport}>내보내기</Button>

                <Button className="responsive-icon-btn" icon={<PlusOutlined />} onClick={showAddModal}>추가</Button>
                <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                  <Button className="responsive-icon-btn" icon={<EyeOutlined />}>필드 보기</Button>
                </Dropdown>
              </Space>
            </div>

            <SmartTable tableId="guest_book_table"
                lastRefreshed={dataUpdatedAt}
                size={settings.tableDensity}
                dataSource={result}
                columns={columns}
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                rowKey="id"
                scroll={{ x: 'max-content' }}
                onRow={(record: GuestBookData) => ({
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
        </Content>

        {/* 추가/편집 모달 재사용 구조 */}
        {(['add', 'edit'] as const).map(mode => {
          const isAdd = mode === 'add';
          const visible = isAdd ? isAddModalVisible : isModalVisible;
          const setVisible = isAdd ? setIsAddModalVisible : setIsModalVisible;

          return (
              <Modal
                  key={mode}
                  title={`결혼식 방명록 ${isAdd ? '추가' : '편집'}`}
                  open={visible}
                  onOk={() => handleAddOrEdit(mode)}
                  onCancel={() => setVisible(false)}
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
          )
        })}

        <Modal title="결혼식 방명록 상세" open={isDetailModalVisible} onCancel={() => setIsDetailModalVisible(false)} footer={[<Button key="close" onClick={() => setIsDetailModalVisible(false)}>닫기</Button>]}>
            {currentGuest && (
                <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="이름">{currentGuest.name}</Descriptions.Item>
                    <Descriptions.Item label="금액">{new Intl.NumberFormat().format(currentGuest.amount)}</Descriptions.Item>
                    <Descriptions.Item label="일자">{currentGuest.date}</Descriptions.Item>
                    <Descriptions.Item label="장소">{currentGuest.area}</Descriptions.Item>
                    <Descriptions.Item label="참석 여부">
                        {currentGuest.attend === 'Y' ? <Tag color="green">참석</Tag> : currentGuest.attend === 'N' ? <Tag color="volcano">미참석</Tag> : <Tag color="default">미정</Tag>}
                    </Descriptions.Item>
                    <Descriptions.Item label="생성 일자">{currentGuest.created_at || '-'}</Descriptions.Item>
                    <Descriptions.Item label="설명">{currentGuest.description}</Descriptions.Item>
                </Descriptions>
            )}
        </Modal>
      </div>
  );
}

export default GuestBook;