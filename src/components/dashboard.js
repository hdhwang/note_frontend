import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Row, Col } from "antd";
import { BankOutlined, BarcodeOutlined, FileTextOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const { Content } = Layout;

function Dashboard() {
    const [counts, setCounts] = useState({
        accountNumbers: 0,
        serialNumbers: 0,
        notes: 0,
        guestbooks: 0,
    });

    const navigate = useNavigate();

    useEffect(() => {
        // Fetch counts from an API or set them statically for now
        setCounts({
            accountNumbers: 10,
            serialNumbers: 20,
            notes: 30,
            guestbooks: 40,
        });
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
                    <Row gutter={16}>
                        <Col span={6}>
                            <Card
                                title="계좌번호"
                                bordered={false}
                                style={{ textAlign: 'center' }}
                                actions={[
                                    <Button type="primary" onClick={() => navigate('/bank-account')}>상세 보기</Button>
                                ]}
                            >
                                <BankOutlined style={{ fontSize: '48px', color: '#08c' }} />
                                <p style={{ fontSize: '24px' }}>{counts.accountNumbers}</p>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card
                                title="시리얼 번호"
                                bordered={false}
                                style={{ textAlign: 'center' }}
                                actions={[
                                    <Button type="primary" onClick={() => navigate('/serial')}>상세 보기</Button>
                                ]}
                            >
                                <BarcodeOutlined style={{ fontSize: '48px', color: '#08c' }} />
                                <p style={{ fontSize: '24px' }}>{counts.serialNumbers}</p>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card
                                title="노트"
                                bordered={false}
                                style={{ textAlign: 'center' }}
                                actions={[
                                    <Button type="primary" onClick={() => navigate('/note')}>상세 보기</Button>
                                ]}
                            >
                                <FileTextOutlined style={{ fontSize: '48px', color: '#08c' }} />
                                <p style={{ fontSize: '24px' }}>{counts.notes}</p>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card
                                title="결혼식 방명록"
                                bordered={false}
                                style={{ textAlign: 'center' }}
                                actions={[
                                    <Button type="primary" onClick={() => navigate('/guest-book')}>상세 보기</Button>
                                ]}
                            >
                                <HeartOutlined style={{ fontSize: '48px', color: '#08c' }} />
                                <p style={{ fontSize: '24px' }}>{counts.guestbooks}</p>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Content>
        </Layout>
    );
}

export default Dashboard;