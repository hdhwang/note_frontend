import React, { useState, useEffect } from 'react';
import { useSettings } from './settings_context';
import { Layout, Table, Button, Space, Row, Col } from "antd";
import { SmartTable } from "./SmartTable";
import type { ColumnsType } from 'antd/es/table'; // 테이블 컬럼 타입 임포트
import { useQuery } from '@tanstack/react-query';
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
  const { data, isFetching, refetch, dataUpdatedAt } = useQuery({
      queryKey: ['lotto'],
      queryFn: async () => {
          const response = await apiClient.get<LottoData[]>('lotto');
          return response.data;
      }
  });

  const loading = isFetching;
  const result = data || [];
  const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number }>({ visible: false, x: 0, y: 0 });

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

  const getData = () => {
      refetch();
  };

  return (
      <div>
        <Content className="main-content">
          <div style={{ width: "100%" }}>
            <Row gutter={[12, 12]} align="middle" justify="space-between" style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12}>
                {/* 왼쪽 영역 */}
              </Col>
              <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
                <Space wrap>
                  <Button className="responsive-icon-btn" icon={<ReloadOutlined />}
                      onClick={getData}
                  >
                    새로고침
                  </Button>
                </Space>
              </Col>
            </Row>

            <div className="table-container">

            <SmartTable tableId="lotto_table"
                size={settings.tableDensity}
                dataSource={result.map((item, index) => ({ ...item, key: index }))}
                columns={columns}
                loading={loading}
                pagination={false}
                rowKey="key"
                bordered
                onRow={() => ({
                    onContextMenu: (e) => {
                        e.preventDefault();
                        if (!contextMenu.visible) {
                            const closeMenu = () => {
                                setContextMenu({ visible: false, x: 0, y: 0 });
                                document.removeEventListener('click', closeMenu);
                            };
                            document.addEventListener('click', closeMenu);
                        }
                        setContextMenu({
                            visible: true,
                            x: e.clientX,
                            y: e.clientY,
                        });
                    }
                })}
            />
            {contextMenu.visible && (
                <ul style={{
                    position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 9999,
                    background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    listStyle: 'none', padding: '4px 0', margin: 0, minWidth: '120px'
                }}>
                    <li style={{ padding: '8px 16px', cursor: 'pointer' }} onClick={() => { getData(); setContextMenu(prev => ({...prev, visible: false})); }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <ReloadOutlined style={{ marginRight: 8 }} /> 새로고침
                    </li>
                </ul>
            )}
            </div>
          </div>
        </Content>
      </div>
  );
};

export default Lotto;