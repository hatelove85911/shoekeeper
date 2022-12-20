import * as React from 'react';
import { Col,Row, Button, Table } from 'antd';
import {localDB} from '../db/db.js'
import { Link } from "react-router-dom";
import ItemList from './ItemList.js'





  const goToScan = () => {
    
  }

export default function InventoryPage() {
    
    return (<>
        <Row>
            <Col span={24}>
                <Link to='/scan'>扫描</Link>
            </Col>
        </Row>
        <Row>
            <Col span={24}>
                <ItemList />
            </Col>
        </Row>
    </>);
}