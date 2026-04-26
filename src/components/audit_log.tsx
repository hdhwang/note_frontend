import React, { useState, useEffect } from 'react';
import { useSettings } from './settings_context';
import { Layout, Table, Button, Input, Checkbox, Dropdown, Space } from "antd";
import { SmartTable } from "./SmartTable";
import type { MenuProps, TablePaginationConfig } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { EyeOutlined, ReloadOutlined } from "@ant-design/icons";
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
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AuditLogData[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const [visibleColumns, setVisibleColumns] = useState({
    user: true,
    ip: true,
    category: true,
    sub_category: true,
    action: true,
    result: true,
    date: true,
  });

  const columnLabels: Record<string, string> = {
    user: '사용자',
    ip: 'IP 주소',
    category: '카테고리',
    sub_category: '보조 카테고리',
    action: '내용',
    result: '결과',
    date: '일자',
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
    },
    {
      title: '일자',
      dataIndex: 'date',
      key: 'date',
      align: 'center' as const,
      sorter: true,
    },
  ];

  // 필터링된 컬럼 생성 및 타입 단언
  const columns = allColumns.filter(column =>
      column.key === 'index' || visibleColumns[column.key as keyof typeof visibleColumns]
  ) as ColumnsType<AuditLogData>;

  const getData = async (page = 1, pageSize = 10, ordering = '-date', filters = {}) => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
        ordering,
        ...filters,
      };
      const response = await apiClient.get('audit-log', { params });
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

  useEffect(() => {
    getData();
  }, []);

  const handleTableChange = (
      pagination: TablePaginationConfig,
      filters: Record<string, any>,
      sorter: any
  ) => {
    const order = sorter.field ? (sorter.order === 'ascend' ? sorter.field : `-${sorter.field}`) : '-date';
    getData(pagination.current || 1, pagination.pageSize || 10, order, filters);
  };

  return (
      <div>
        <Content style={{ padding: '24px' }}>
          <div style={{ width: "100%" }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, flexWrap: 'wrap', gap: '8px 0' }}>
              <Space wrap>
                <Button className="responsive-icon-btn" icon={<ReloadOutlined />}
                    onClick={() => getData(pagination.current, pagination.pageSize)}
                >
                  새로고침
                </Button>
                <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                  <Button className="responsive-icon-btn" icon={<EyeOutlined />}>
                    필드 보기
                  </Button>
                </Dropdown>
              </Space>
            </div>

            <SmartTable tableId="audit_log_table"
                size={settings.tableDensity}
                dataSource={result}
                columns={columns}
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                rowKey="id"
                scroll={{ x: 'max-content' }}
            />
          </div>
        </Content>
      </div>
  );
}

export default AuditLog;