import React from 'react';
import {Divider, Layout, Card}  from "antd";
import '../App.css';
const {Content} = Layout;
function Dashboard() {
    return (
        <Layout style={{marginLeft: 200}}>
            <Content style={{overflow: 'initial'}}>
            <div style={{
                'textAlign': 'left',
                'maxHeight': '100%',
                'maxwidth': '100%',
                'display': 'inline',
                'flexDirection': 'column',
                'justifyContent': 'left',
                'color': '#131629',
            }}>
                <pre />
                <Card style={{padding: '0px 10px'}}>
                    내용 추가
                </Card>
            </div>
            </Content>
        </Layout>
    );
}

export default Dashboard;