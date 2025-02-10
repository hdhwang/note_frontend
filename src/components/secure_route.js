import React, {FC, useEffect, useState} from "react";
import LayoutNav from "./layout";
import {Card, Layout, Spin, Typography} from "antd";
import Forbidden from "./error/forbidden";
import axios from 'axios';
const {Header, Footer} = Layout;

interface Props {
    permissionRequired: string[];
}

export const SecureRoute: FC<Props> = ({component: Component, permissionRequired}) => {
    const [spinning, setSpinning] = useState(true);
    const [permissions, setPermissions] = useState([""]);

    return <>
        <Header style={{
            marginLeft: 200,
            marginRight: 0,
            textAlign: 'center',
            color: 'white',
            backgroundColor: '#131629',
            fontSize: 'calc(10px + 2vmin)'
        }}><Typography.Text style={{color: '#ffffff', fontSize: 25}}><b>NOTEPAD</b></Typography.Text></Header>
        <LayoutNav permissions={permissions} />
        <Component />
        <pre/>
        <Footer style={{
            marginLeft: 200,
            marginRight: 0,
            bottom: 0,
            textAlign: 'center',
            color: 'white',
            backgroundColor: 'lightgrey',
            fontSize: 'calc(14px)',
            padding: '10px 10px',
        }}>
            COPYRIGHT © HWANG HADONG. ALL RIGHT RESERVED
        </Footer>
    </>
};

export default SecureRoute;