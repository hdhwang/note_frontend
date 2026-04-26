import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Button, Space } from "antd";
import type { ColumnsType } from 'antd/es/table'; // 테이블 컬럼 타입 임포트
import '../App.css';
import apiClient from './api/api_client';
import { ReloadOutlined } from "@ant-design/icons";

const { Content } = Layout;

// 1. 로또 데이터 인터페이스 정의
interface LottoData {
  num: number;
  value: string;
  key?: number; // Table용 고유 키
}

// 2. Props 타입 정의
interface LottoProps {
  collapsed: boolean;
}

const Lotto: React.FC<LottoProps> = ({ collapsed }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<LottoData[]>([]);

  // 3. 테이블 컬럼에 타입 적용
  const columns: ColumnsType<LottoData> = [
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
      const response = await apiClient.get<LottoData[]>('lotto');
      setResult(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
      <div>
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
      </div>
  );
};

export default Lotto;