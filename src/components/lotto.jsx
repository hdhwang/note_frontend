import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Button, Space } from "antd";
import '../App.css';
import apiClient from './api/api_client';
import { ReloadOutlined } from "@ant-design/icons";

const { Content } = Layout;

function Lotto({ collapsed }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);

  const columns = [
    {
      title: '게임 수',
      dataIndex: 'num',
      key: 'num',
      align: 'center',
    },
    {
      title: '생성 번호',
      dataIndex: 'value',
      key: 'value',
      align: 'center',
    },
  ];

  const getData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('lotto');
      setResult(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Content style={{ padding: '24px' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <Space>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={getData}
                >
                  새로고침
                </Button>
              </Space>
            </div>

            <Table
                dataSource={result.map((item, index) => ({ ...item, key: index }))}
                columns={columns}
                loading={loading}
                pagination={false}
                rowKey="key"
                bordered
            />
          </Card>
        </Content>
      </Layout>
  );
}

export default Lotto;