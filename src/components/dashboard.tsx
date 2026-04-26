import React, { useState, useEffect, CSSProperties } from 'react';
import { Layout, Card, Row, Col, Statistic } from 'antd';
import '../App.css';
import apiClient from './api/api_client';

const { Content } = Layout;

// 1. 대시보드 통계 데이터 인터페이스 정의
interface DashboardStats {
    bank_account_count: number;
    serial_count: number;
    note_count: number;
    guest_book_count: number;
}

// 2. Props 타입 정의
interface DashboardProps {
    collapsed: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ collapsed }) => {
    // 초기 상태값에 인터페이스 적용
    const [counts, setCounts] = useState<DashboardStats>({
        bank_account_count: 0,
        serial_count: 0,
        note_count: 0,
        guest_book_count: 0,
    });

    useEffect(() => {
        const getData = async () => {
            try {
                // API 호출 시 응답 데이터 타입 명시
                const response = await apiClient.get<DashboardStats>('dashboard/stats');
                setCounts(response.data);
            } catch (error) {
                console.error('Failed to fetch counts:', error);
            }
        };

        getData();
    }, []);

    // 3. 스타일 객체 정의
    const statisticContentStyle: CSSProperties = {
        color: "#ffffff",
        fontWeight: "bold"
    };

    return (
        /* SecureRoute에서 이미 전체 레이아웃과 여백을 잡고 있으므로,
           여기서는 최상단 Layout 태그를 제거하여 레이아웃 중첩 에러를 방지합니다.
        */
        <div style={{ padding: '0px' }}>
            <Content style={{ overflow: 'initial' }}>
                <div style={{
                    textAlign: 'left',
                    color: '#131629',
                }}>
                    <Card style={{ textAlign: 'center', border: 'none', backgroundColor: 'transparent' }}>
                        <Row gutter={[16, 16]} style={{ textAlign: 'center' }} wrap={true}>

                            {/* 계좌번호 */}
                            <Col xs={24} sm={12} md={6}>
                                <Card size='small' style={{ background: '#3F8600', border: 'none' }}
                                      title={<div style={{ color: "#ffffff", fontWeight: "bold" }}>계좌번호</div>}>
                                    <Statistic
                                        value={counts.bank_account_count}
                                        // Warning 해결: valueStyle 대신 styles.content 사용
                                        styles={{ content: statisticContentStyle }}
                                    />
                                </Card>
                            </Col>

                            {/* 시리얼 번호 */}
                            <Col xs={24} sm={12} md={6}>
                                <Card size='small' style={{ background: '#CC4525', border: 'none' }}
                                      title={<div style={{ color: "#ffffff", fontWeight: "bold" }}>시리얼 번호</div>}>
                                    <Statistic
                                        value={counts.serial_count}
                                        styles={{ content: statisticContentStyle }}
                                    />
                                </Card>
                            </Col>

                            {/* 노트 */}
                            <Col xs={24} sm={12} md={6}>
                                <Card size='small' style={{ background: '#E5AB19', border: 'none' }}
                                      title={<div style={{ color: "#ffffff", fontWeight: "bold" }}>노트</div>}>
                                    <Statistic
                                        value={counts.note_count}
                                        styles={{ content: statisticContentStyle }}
                                    />
                                </Card>
                            </Col>

                            {/* 결혼식 방명록 */}
                            <Col xs={24} sm={12} md={6}>
                                <Card size='small' style={{ background: '#346AF3', border: 'none' }}
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
        </div>
    );
}

export default Dashboard;