import React, { useState, useEffect } from 'react';
import { useSettings } from './settings_context';
import { Layout, Table, Button, Space } from "antd";
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
          <div style={{ width: "100%" }}>
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
        </Content>
      </div>
  );
};

export default Lotto;