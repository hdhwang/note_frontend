import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Result } from "antd";

// React.FC (Functional Component) 타입을 지정합니다.
const Forbidden: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Result
            status="403"
            title="403"
            subTitle="Sorry, you are not authorized to access this page."
            extra={
                <Button type="primary" onClick={() => navigate('/')}>
                    Back Home
                </Button>
            }
        />
    );
};

export default Forbidden;