import type {CountdownProps} from "antd";
import {Button, Result, Statistic} from "antd";
import {useNavigate} from "react-router-dom";

const {Countdown} = Statistic;

const deadline = Date.now() + 3000;

const NotFound = () => {
    const navigate = useNavigate();
    const onFinish: CountdownProps['onFinish'] = () => navigate('/');
    return (
        <>
            <Result
                status='404'
                title='404'
                subTitle={<>
                    <div>Sorry, the page you visited does not exist.</div>
                    <Countdown value={deadline} onFinish={onFinish} format='s' />
                </>}
                extra={<Button type='primary' onClick={() => navigate('/')}>Back Home</Button>}
            />
        </>
    )
}

export default NotFound;