import React, {useState, useEffect} from 'react';
import { Layout, Card, Table, Button, Input, message, Modal } from "antd";
import '../App.css';
import apiClient from './api/api_client';
import {DeleteOutlined} from "@ant-design/icons";
const {Content} = Layout;

function BankAccount() {
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
      title: '은행',
      dataIndex: 'bank',
      key: 'bank',
      align: 'center',
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
                placeholder="Search name"
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
      title: '계좌번호',
      dataIndex: 'account',
      key: 'account',
      align: 'center',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
                placeholder="Search name"
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
      title: '예금주',
      dataIndex: 'account_holder',
      key: 'account_holder',
      align: 'center',
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
                placeholder="Search name"
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
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
                placeholder="Search name"
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
        title: '삭제',
        key: 'delete',
        align: 'center',
        render: (text, record) => (
            <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
            />
        ),
    },
  ];

  const getData = async (page = 1, pageSize = 10, ordering = null, filters = {}) => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        ordering,
        ...filters,
      };
      const response = await apiClient.get('bank-account', { params });
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
            title: '선택한 계좌번호를 삭제 하시겠습니까?',
            okText: '확인',
            okType: 'danger',
            cancelText: '취소',
            onOk: async () => {
                try {
                    await apiClient.delete(`bank-account/${id}`);
                    message.success('계좌번호 삭제에 성공하였습니다.');
                    getData(pagination.current, pagination.pageSize);
                } catch (error) {
                    message.error('계좌번호 삭제에 실패하였습니다.');
                }
            },
        });
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
                  }}
                  onChange={handleTableChange}
                  rowKey="id"/>
            </Card>
          </div>
        </Content>
      </Layout>
  );
}

export default BankAccount;