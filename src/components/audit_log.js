import React, {useState, useEffect} from 'react';
import {Layout, Card, Table, Button, Input}  from "antd";
import '../App.css';
import apiClient from './api/api_client';
const {Content} = Layout;

function AuditLog() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({});

  const columns = [
    {
      title: '번호',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: '사용자',
      dataIndex: 'user',
      key: 'user',
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
      onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'IP 주소',
      dataIndex: 'ip',
      key: 'ip',
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
      onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      align: 'center',
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
      onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '보조 카테고리',
      dataIndex: 'sub_category',
      key: 'sub_category',
      align: 'center',
      sorter: true,
      filters: [
        { text: '-', value: '-' },
        { text: '로그인', value: '로그인' },
        { text: '로그아웃', value: '로그아웃' },
        { text: '사용자 관리', value: '사용자 관리' },
        { text: '권한 통계', value: '권한 통계' },
      ],
      onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '내용',
      dataIndex: 'action',
      key: 'action',
      align: 'left',
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
      onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '결과',
      dataIndex: 'result',
      key: 'result',
      align: 'center',
      sorter: true,
      filters: [
        { text: '성공', value: '성공' },
        { text: '실패', value: '실패' },
      ],
      onFilter: (value, record) => record.result.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '일자',
      dataIndex: 'date',
      key: 'date',
      align: 'center',
      sorter: true,
    },
  ];

  const getData = async (page = 1, pageSize = 10, ordering = '-date', filters = {}) => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
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
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleTableChange =  (pagination, filters, sorter) => {
    const sortField = sorter.field;
    const sortOrder = sorter.order === 'ascend' ? '' : '-';
    const order = sortOrder + sortField;
    setFilters(filters);
    getData(pagination.current, pagination.pageSize, order);
  };

  return (
      <Layout style={{marginLeft: 200}}>
        <Content style={{overflow: 'initial'}}>
          <div style={{
            'textAlign': 'left',
            'maxHeight': '100%',
            'maxwidth': '100%',
            'display': 'inline',
            'flexDirection': 'column',
            'justifyContent': 'left',
            'color': '#131629',
          }}>
            <Card style={{padding: '0px 10px'}}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <Button onClick={() => getData(pagination.current, pagination.pageSize)} style={{ marginBottom: 16 }}>
                  새로고침
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
                  rowKey="id"/>
            </Card>
          </div>
        </Content>
      </Layout>
  );
}

export default AuditLog;