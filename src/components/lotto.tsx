import React, { useState, useEffect } from 'react';
import { useSettings } from './settings_context';
import { Layout, Card, Table, Button, Space } from "antd";
import { SmartTable } from "./SmartTable";
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

const Lotto: React.FC = () => {
  const { settings } = useSettings();
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
          <Card bordered={false} style={{ width: "100%" }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, flexWrap: 'wrap', gap: '8px 0' }}>
              <Space wrap>
                <Button className="responsive-icon-btn" icon={<ReloadOutlined />}
                    onClick={getData}
                >
                  새로고침
                </Button>
              </Space>
            </div>

            <SmartTable tableId="lotto_table"
                size={settings.tableDensity}
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