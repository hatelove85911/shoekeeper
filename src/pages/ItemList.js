import * as React from 'react';
import { Col,Row, Button, Table } from 'antd';
import {localDB} from '../db/db.js'
import { Link } from "react-router-dom";



const columns = [
    {
      title: '图片',
      dataIndex: 'image'
    //   sorter: (a, b) => a.age - b.age,
    //   filterSearch: true,
    //   onFilter: (value, record) => record.styleColor.includes(value),
    },
    {
      title: '型号',
    //   dataIndex: 'styleColor',
    //   defaultSortOrder: 'ascend',
    //   sortDirections: ['ascend', 'descend'],
      sorter: (a, b) => a.styleColor.localeCompare(b.styleColor),
      render: (text, record, index) => (
        <>
           <div>{record.styleColor}</div> 
           <div>{record.title}</div> 
           <div>尺码:{record.size}</div> 
        </>
      )
    //   sorter: (a, b) => a.age - b.age,
    //   filterSearch: true,
    //   onFilter: (value, record) => record.styleColor.includes(value),

    },
    {
      title: '状态',
      dataIndex: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status)
    },
    {
      title: '价格',
      dataIndex: 'costPrice'
    },
    {
      title: '标签',
      dataIndex: 'tags'
    },
  ];
  const data = [
    {
      key: '1',
      styleColor: 'John Brown',
      size: 32,
      status: 'normal',
    },
    {
      key: '2',
      styleColor: 'Jim Green',
      size: 42,
      status: 'normal',
    },
    {
      key: '3',
      styleColor: 'Joe Black',
      size: 32,
      status: 'bolt',
    },
    {
      key: '4',
      styleColor: 'Jim Red',
      size: 32,
      status: 'sold',
    },
  ];
  const onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
  };


  const goToScan = () => {
    
  }

export default function ItemList() {
    return (<Table columns={columns} dataSource={data} onChange={onChange} pagination={false} />);
}