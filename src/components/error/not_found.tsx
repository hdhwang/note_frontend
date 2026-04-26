import React from 'react';
import { Button, Result, Statistic } from "antd";
import { useNavigate } from "react-router-dom";

const { Countdown } = Statistic;

// 3초 후 이동을 위한 데드라인 설정
const deadline: number = Date.now() + 3000;

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    // 런타임 에러 방지를 위해 간단한 함수로 정의
    const onFinish = () => {
        navigate('/');
    };

    return (
        <Result
            status="404"
            title="404"
            subTitle={
                <>
                    <div>Sorry, the page you visited does not exist.</div>
                    {/* format에 문구 추가 가능 (예: 's초 후 이동') */}
                    <Countdown
                        value={deadline}
                        onFinish={onFinish}
                        format="s"
                        valueStyle={{ fontSize: '14px', color: '#999' }}
                    />
                </>
            }
            extra={
                <Button type="primary" onClick={() => navigate('/')}>
                    Back Home
                </Button>
            }
        />
    );
};

export default NotFound;