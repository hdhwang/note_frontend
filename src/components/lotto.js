import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Button } from "antd";
import '../App.css';
import apiClient from './api/api_client';
const { Content } = Layout;

function Lotto({collapsed}) {
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
              <Button onClick={getData} style={{ marginBottom: 16 }}>
                새로고침
              </Button>
            </div>
            <Table
              dataSource={result.map((item, index) => ({ ...item, key: index }))}
              columns={columns}
              loading={loading}
              pagination={false}
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
}

export default Lotto;