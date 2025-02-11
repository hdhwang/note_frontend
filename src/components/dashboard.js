import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Statistic, Grid } from 'antd';
import '../App.css';
import apiClient from './api/api_client';

const { Content } = Layout;
const { useBreakpoint } = Grid;

function Dashboard() {
    const [counts, setCounts] = useState({
        bank_account_count: 0,
        serial_count: 0,
        note_count: 0,
        guest_book_count: 0,
    });

    const screens = useBreakpoint();

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await apiClient.get('dashboard/stats');
                setCounts(response.data);
            } catch (error) {
                console.error('Failed to fetch counts:', error);
            }
        };

        getData();
    }, []);

    return (
      <Layout style={{ marginLeft: 200 }}>
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
                  <Card sytle={{marginLeft: 200, marginRight:0, textAlign: 'center'}}>
                      <Row gutter={[10, 16]} style={{ textAlign: 'center' }} wrap={true}>
                          <Col xs={24} sm={12} md={6}>
                              <Card bordered={false} size='small' style={{ paddingLeft: 15, paddingRight: 15, background: '#3F8600'}} title={<div style={{ color: "#ffffff", fontWeight: "bold"}}>계좌번호</div>}>
                                  <Statistic value={counts.bank_account_count} valueStyle={{ color: "#ffffff", fontWeight: "bold"}} />
                              </Card>
                          </Col>

                          <Col xs={24} sm={12} md={6}>
                              <Card bordered={false} size='small' style={{ paddingLeft: 15, paddingRight: 15, background: '#CC4525'}} title={<div style={{ color: "#ffffff", fontWeight: "bold"}}>시리얼 번호</div>}>
                                  <Statistic value={counts.serial_count} valueStyle={{ color: "#ffffff", fontWeight: "bold"}} />
                              </Card>
                          </Col>

                          <Col xs={24} sm={12} md={6}>
                              <Card bordered={false} size='small' style={{ paddingLeft: 15, paddingRight: 15, background: '#E5AB19'}} title={<div style={{ color: "#ffffff", fontWeight: "bold"}}>노트</div>}>
                                  <Statistic value={counts.note_count} valueStyle={{ color: "#ffffff", fontWeight: "bold"}} />
                              </Card>
                          </Col>

                          <Col xs={24} sm={12} md={6}>
                              <Card bordered={false} size='small' style={{ paddingLeft: 15, paddingRight: 15, background: '#346AF3'}} title={<div style={{ color: "#ffffff", fontWeight: "bold"}}>결혼식 방명록</div>}>
                                  <Statistic value={counts.guest_book_count} valueStyle={{ color: "#ffffff", fontWeight: "bold"}} />
                              </Card>
                          </Col>
                      </Row>
                  </Card>
              </div>
          </Content>
      </Layout>
    );
}

export default Dashboard;