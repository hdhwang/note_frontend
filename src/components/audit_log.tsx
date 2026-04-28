import React, { useState, useEffect } from 'react';
import { useSettings } from './settings_context';
import { Layout, Table, Button, Input, Checkbox, Dropdown, Space, Modal, Descriptions, Tag, DatePicker, message } from "antd";

const { RangePicker } = DatePicker;
import { SmartTable } from "./SmartTable";
import { useQuery } from '@tanstack/react-query';
import { useUrlQueryParams } from '../hooks/useUrlQueryParams';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import type { MenuProps, TablePaginationConfig } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { EyeOutlined, ReloadOutlined, InfoCircleOutlined, DownloadOutlined } from "@ant-design/icons";

import '../App.css';
import apiClient from './api/api_client';

const { Content } = Layout;

// 1. 로그 데이터 인터페이스 정의
interface AuditLogData {
  id: number;
  user: string;
  ip: string;
  category: string;
  sub_category: string;
  action: string;
  result: string;
  date: string;
}

const AuditLog: React.FC = () => {
  const { settings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultStartDate = dayjs().subtract(1, 'month').format('YYYY-MM-DD HH:mm');
  const defaultEndDate = dayjs().format('YYYY-MM-DD HH:mm');
  
  const initialDateRange: [string, string] = [
      searchParams.get('start_date') || defaultStartDate,
      searchParams.get('end_date') || defaultEndDate
  ];
  const [dateRange, setDateRangeState] = useState<[string, string]>(initialDateRange);
  const [queryParams, setQueryParams] = useUrlQueryParams('-date');

  const { data, isFetching, refetch, dataUpdatedAt } = useQuery({
      queryKey: ['audit-log', queryParams, dateRange],
      queryFn: async () => {
          const params: any = {
            page: queryParams.page,
            page_size: queryParams.pageSize,
            ordering: queryParams.ordering,
            ...queryParams.filters,
          };
          if (dateRange && dateRange[0] && dateRange[1]) {
            params.start_date = dateRange[0] + ':00';
            params.end_date = dateRange[1] + ':59';
          }
          const response = await apiClient.get('audit-log', { params });
          return response.data;
      }
  });

  const loading = isFetching;
  const result = data?.results || [];
  const pagination = { current: queryParams.page, pageSize: queryParams.pageSize, total: data?.count || 0 };

  const setDateRange = (newRange: [string, string]) => {
      setDateRangeState(newRange);
      const nextParams = new URLSearchParams(searchParams);
      if (newRange[0]) nextParams.set('start_date', newRange[0]);
      if (newRange[1]) nextParams.set('end_date', newRange[1]);
      setSearchParams(nextParams, { replace: true });
  };

  const [visibleColumns, setVisibleColumns] = useState({
    user: true,
    ip: true,
    category: true,
    sub_category: true,
    action: true,
    result: true,
    date: true,
    actions: true,
  });

  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [currentLog, setCurrentLog] = useState<AuditLogData | null>(null);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, record: AuditLogData | null }>({ visible: false, x: 0, y: 0, record: null });

  const columnLabels: Record<string, string> = {
    user: '사용자',
    ip: 'IP 주소',
    category: '카테고리',
    sub_category: '보조 카테고리',
    action: '내용',
    result: '결과',
    date: '생성 일자',
    actions: '작업',
  };

  const handleColumnVisibilityChange = (columnKey: string) => {
    setVisibleColumns(prevState => ({
      ...prevState,
      [columnKey as keyof typeof visibleColumns]: !prevState[columnKey as keyof typeof visibleColumns],
    }));
  };

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

  // 3. 테이블 컬럼 정의 (에러 해결 핵심 부분)
  const allColumns: ColumnType<AuditLogData>[] = [
    {
      title: '번호',
      dataIndex: 'index',
      key: 'index',
      align: 'center' as const, // AlignType 보장
      render: (_: any, __: any, index: number) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: '사용자',
      dataIndex: 'user',
      key: 'user',
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
      title: 'IP 주소',
      dataIndex: 'ip',
      key: 'ip',
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
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      align: 'center' as const,
      sorter: true,
      filters: [
        { text: '계정', value: '계정' },
        { text: '대시보드', value: '대시보드' },
        { text: '계좌번호 관리', value: '계좌번호 관리' },
        { text: '시리얼 번호 관리', value: '시리얼 번호 관리' },
        { text: '노트 관리', value: '노트 관리' },
        { text: '결혼식 방명록', value: '결혼식 방명록' },
        { text: '로또 번호 생성', value: '로또 번호 생성' },
        { text: '계정 관리', value: '계정 관리' },
      ],
      filterMultiple: false,
    },
    {
      title: '보조 카테고리',
      dataIndex: 'sub_category',
      key: 'sub_category',
      align: 'center' as const,
      sorter: true,
      filters: [
        { text: '-', value: '-' },
        { text: '로그인', value: '로그인' },
        { text: '로그아웃', value: '로그아웃' },
        { text: '사용자 관리', value: '사용자 관리' },
        { text: '권한 통계', value: '권한 통계' },
      ],
      filterMultiple: false,
    },
    {
      title: '내용',
      dataIndex: 'action',
      key: 'action',
      align: 'left' as const,
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
      title: '결과',
      dataIndex: 'result',
      key: 'result',
      align: 'center' as const,
      sorter: true,
      filters: [
        { text: '성공', value: '성공' },
        { text: '실패', value: '실패' },
      ],
      filterMultiple: false,
      render: (text: string) => {
          let color = text === '성공' ? 'green' : (text === '실패' ? 'volcano' : 'default');
          return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '생성 일자',
      dataIndex: 'date',
      key: 'date',
      align: 'center' as const,
      sorter: true,
    },
    {
      title: '작업',
      key: 'actions',
      align: 'center' as const,
      render: (_: any, record: AuditLogData) => (
          <Space size={2}>
            <Button type="text" icon={<InfoCircleOutlined />} onClick={(e) => { e.stopPropagation(); showDetail(record); }} />
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
  ) as ColumnsType<AuditLogData>;

  const getData = (page = queryParams.page, pageSize = queryParams.pageSize, ordering = queryParams.ordering, filters = queryParams.filters, dRange = dateRange) => {
      setQueryParams({ page, pageSize, ordering, filters });
      if (dRange !== dateRange) {
          setDateRange(dRange);
      } else if (page === queryParams.page && pageSize === queryParams.pageSize && ordering === queryParams.ordering && JSON.stringify(filters) === JSON.stringify(queryParams.filters)) {
          refetch();
      }
  };

  const showDetail = (log: AuditLogData) => {
    setCurrentLog(log);
    setIsDetailModalVisible(true);
  };

  const handleTableChange = (
      pagination: TablePaginationConfig,
      filters: Record<string, any>,
      sorter: any
  ) => {
    const order = sorter.field ? (sorter.order === 'ascend' ? sorter.field : `-${sorter.field}`) : '-date';
    getData(pagination.current || 1, pagination.pageSize || 10, order, filters);
  };

  const handleExport = async () => {
    const hide = message.loading('내보내기를 진행 중입니다.', 0);
    try {
      const params: any = { ordering: queryParams.ordering, ...queryParams.filters };
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.start_date = dateRange[0] + ':00';
        params.end_date = dateRange[1] + ':59';
      }

      const response = await apiClient.get('audit-log/export', { 
        params, 
        responseType: 'blob' 
      });
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = '감사 로그.zip';
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <RangePicker 
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                  value={dateRange[0] && dateRange[1] ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
                  onChange={(dates, dateStrings) => {
                      setDateRange(dateStrings as [string, string]);
                      getData(1, pagination.pageSize, '-date', {}, dateStrings as [string, string]);
                  }}
              />
              <Space wrap style={{ marginLeft: 'auto' }}>
                <Button className="responsive-icon-btn" icon={<ReloadOutlined />}
                    onClick={() => getData(pagination.current, pagination.pageSize)}
                >
                  새로고침
                </Button>
                <Button className="responsive-icon-btn" icon={<DownloadOutlined />}
                    onClick={handleExport}
                >
                  내보내기
                </Button>

                <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                  <Button className="responsive-icon-btn" icon={<EyeOutlined />}>
                    필드 보기
                  </Button>
                </Dropdown>
              </Space>
            </div>

            <SmartTable tableId="audit_log_table"
                lastRefreshed={dataUpdatedAt}
                size={settings.tableDensity}
                dataSource={result}
                columns={columns}
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                rowKey="id"
                scroll={{ x: 'max-content' }}
                onRow={(record: AuditLogData) => ({
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
                    <li style={{ padding: '8px 16px', cursor: 'pointer' }} onClick={() => { showDetail(contextMenu.record!); setContextMenu(prev => ({...prev, visible: false})); }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <InfoCircleOutlined style={{ marginRight: 8 }} /> 상세 보기
                    </li>
                </ul>
            )}
          </div>
        </Content>

        <Modal title="감사 로그 상세" open={isDetailModalVisible} onCancel={() => setIsDetailModalVisible(false)} footer={[<Button key="close" onClick={() => setIsDetailModalVisible(false)}>닫기</Button>]}>
            {currentLog && (
                <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="사용자">{currentLog.user}</Descriptions.Item>
                    <Descriptions.Item label="IP 주소">{currentLog.ip}</Descriptions.Item>
                    <Descriptions.Item label="카테고리">{currentLog.category}</Descriptions.Item>
                    <Descriptions.Item label="보조 카테고리">{currentLog.sub_category}</Descriptions.Item>
                    <Descriptions.Item label="내용">{currentLog.action}</Descriptions.Item>
                    <Descriptions.Item label="결과">
                        {(() => {
                            let color = currentLog.result === '성공' ? 'green' : (currentLog.result === '실패' ? 'volcano' : 'default');
                            return <Tag color={color}>{currentLog.result}</Tag>;
                        })()}
                    </Descriptions.Item>
                    <Descriptions.Item label="생성 일자">{currentLog.date}</Descriptions.Item>
                </Descriptions>
            )}
        </Modal>
      </div>
  );
}

export default AuditLog;