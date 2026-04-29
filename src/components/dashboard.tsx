import React, { useState, useEffect, CSSProperties } from 'react';
import { Layout, Card, Row, Col, Statistic } from 'antd';
import { useNavigate } from 'react-router-dom';
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

// 2. 카드 설정 데이터 구조
interface CardConfig {
    id: string;
    path: string;
    title: string;
    countKey: keyof DashboardStats;
    bg: string;
}

const initialCards: CardConfig[] = [
    {
        id: 'guest_book',
        path: '/guest-book',
        title: '결혼식 방명록',
        countKey: 'guest_book_count',
        bg: 'linear-gradient(135deg, #667eea, #764ba2)'
    },
    {
        id: 'bank_account',
        path: '/bank-account',
        title: '계좌번호',
        countKey: 'bank_account_count',
        bg: 'linear-gradient(135deg, #11998e, #38ef7d)'
    },
    {
        id: 'note',
        path: '/note',
        title: '노트',
        countKey: 'note_count',
        bg: 'linear-gradient(135deg, #f7971e, #ffd200)'
    },
    {
        id: 'serial',
        path: '/serial',
        title: '시리얼 번호',
        countKey: 'serial_count',
        bg: 'linear-gradient(135deg, #eb3349, #f45c43)'
    }
];

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

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
            <Content className="main-content" style={{ overflow: 'initial' }}>
                <div style={{
                    width: '100%',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                }}>
                    <Row gutter={[16, 16]} justify="center">
                        {initialCards.map((card) => (
                            <Col xs={12} sm={12} md={6} key={card.id}>
                                    <Card 
                                        size='small' 
                                        hoverable
                                        onClick={() => navigate(card.path)}
                                        style={{ 
                                            background: card.bg, 
                                            border: 'none', 
                                            borderRadius: '12px',
                                            cursor: 'pointer' // 드래그 및 클릭 가능한 포인터
                                        }}
                                        title={<div style={{ color: "#ffffff", fontWeight: "bold" }}>{card.title}</div>}
                                    >
                                        <Statistic
                                            value={counts[card.countKey]}
                                            styles={{ content: statisticContentStyle }}
                                        />
                                    </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </Content>
        </div>
    );
}

export default Dashboard;