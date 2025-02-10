import React, {useState, useEffect} from 'react';
import {Spin, Divider, Layout, Card, Table}  from "antd";
import '../App.css';
import apiClient from './api/api_client';
const {Content} = Layout;

function Lotto() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('lotto');
        setResult(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

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
          <pre />
          <Card style={{padding: '0px 10px'}}>
            <Table dataSource={result} columns={columns} loading={loading} />
          </Card>
        </div>
      </Content>
    </Layout>
  );
}

export default Lotto;