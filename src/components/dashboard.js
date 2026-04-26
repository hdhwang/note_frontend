import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Statistic } from 'antd';
import '../App.css';
import apiClient from './api/api_client';

const { Content } = Layout;

function Dashboard({ collapsed }) {
    const [counts, setCounts] = useState({
        bank_account_count: 0,
        serial_count: 0,
        note_count: 0,
        guest_book_count: 0,
    });

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

    // 공통 텍스트 스타일 정의
    const statisticContentStyle = { color: "#ffffff", fontWeight: "bold" };

    return (
        <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
            <Content style={{ overflow: 'initial', padding: '24px' }}>
                <div style={{
                    textAlign: 'left',
                    color: '#131629',
                }}>
                    <Card style={{ textAlign: 'center' }}>
                        <Row gutter={[16, 16]} style={{ textAlign: 'center' }} wrap={true}>

                            {/* 계좌번호 */}
                            <Col xs={24} sm={12} md={6}>
                                <Card variant='borderless' size='small' style={{ background: '#3F8600' }}
                                      title={<div style={{ color: "#ffffff", fontWeight: "bold" }}>계좌번호</div>}>
                                    <Statistic
                                        value={counts.bank_account_count}
                                        styles={{ content: statisticContentStyle }}
                                    />
                                </Card>
                            </Col>

                            {/* 시리얼 번호 */}
                            <Col xs={24} sm={12} md={6}>
                                <Card variant='borderless' size='small' style={{ background: '#CC4525' }}
                                      title={<div style={{ color: "#ffffff", fontWeight: "bold" }}>시리얼 번호</div>}>
                                    <Statistic
                                        value={counts.serial_count}
                                        styles={{ content: statisticContentStyle }}
                                    />
                                </Card>
                            </Col>

                            {/* 노트 */}
                            <Col xs={24} sm={12} md={6}>
                                <Card variant='borderless' size='small' style={{ background: '#E5AB19' }}
                                      title={<div style={{ color: "#ffffff", fontWeight: "bold" }}>노트</div>}>
                                    <Statistic
                                        value={counts.note_count}
                                        styles={{ content: statisticContentStyle }}
                                    />
                                </Card>
                            </Col>

                            {/* 결혼식 방명록 */}
                            <Col xs={24} sm={12} md={6}>
                                <Card variant='borderless' size='small' style={{ background: '#346AF3' }}
                                      title={<div style={{ color: "#ffffff", fontWeight: "bold" }}>결혼식 방명록</div>}>
                                    <Statistic
                                        value={counts.guest_book_count}
                                        styles={{ content: statisticContentStyle }}
                                    />
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