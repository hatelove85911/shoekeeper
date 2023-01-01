import * as React from 'react';
import {useState, useRef} from 'react';
import {  Button, Table, Tag, Image, Space, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';


import ImageByStyleColor from './ImageByStyleColor'

const onChange = (pagination, filters, sorter, extra) => {
  console.log('params', pagination, filters, sorter, extra);
};

export default function ItemList({ items, mode='inventory', addInventory, deleteItem, bolt, returnToInventory, sell, bulkAddInventory, bulkBolt, bulkDelete, bulkClear, matchInventory}) {
  const searchInput = useRef(null);

  const actionBar = () => {
    const countItems = (statuses) => items.filter(item => statuses.some(s => s === item.status))
    const normalCount = countItems(['normal']).length
    const boltCount = countItems(['bolt']).length
    const soldCount = countItems(['sold']).length
    const profit = countItems(['sold']).reduce((result, curr) => result + Number(curr.soldPrice) - Number(curr.costPrice), 0)
    const inventoryCost = countItems(['normal', 'bolt']).reduce((result, curr) => result + Number(curr.costPrice), 0)
    return (<Space>
      {mode === 'inventory' && <div>
        总数:{items.length} 在库: {normalCount} 闪电: {boltCount} 库存成本:¥{inventoryCost} 已售: {soldCount}, 利润: ¥{profit}
        <br/>
        
        </div>
        
      }
      {mode === 'scan' && <Space.Compact>
          总数:{items.length}
          <Button onClick={bulkAddInventory}>全部入库</Button>
          <Button onClick={bulkBolt}>全部闪电</Button>
          <Button onClick={matchInventory}>匹配在库</Button>
          <Button onClick={bulkClear}>清空</Button>
        </Space.Compact>}
    </Space>)
  }
  const colorMap = {
    normal: 'success',
    bolt: 'black',
    scan: 'grey',
    sold: 'blue'
  }
  const statusMap = {
    normal: '在库',
    bolt: '闪电',
    scan: '扫描',
    sold: '已售'
  }

  const statuses = Array.from(new Set(items.map(item => item.status))).map(status => ({
    text: statusMap[status],
    value: status
  }))
  const columns = [
    {
      title: '图片',
      render: (text, record) => {
        return (<ImageByStyleColor styleColor={record?.styleColor}></ImageByStyleColor>)
      },
      filters: statuses,
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '型号',
      //   dataIndex: 'styleColor',
      //   defaultSortOrder: 'ascend',
      //   sortDirections: ['ascend', 'descend'],
      sorter: (a, b) => a.styleColor.localeCompare(b.styleColor),
      render: (text, record, index) => {
        const profit = record.soldPrice ? record.soldPrice - record.costPrice : NaN
        return(
          <>
            <div>{record.styleColor}</div>
            <div>{record.title}</div>
            <div>尺码:{record.size}</div>
            <div>成本:{record.costPrice}</div>
            {record.soldPrice && <div>售出:{record.soldPrice} <span style={{color:profit > 0 ? 'green' : 'red'}}>{profit > 0 ? '+' : ''}{profit}</span></div>}
            <Tag color={colorMap[record.status]}>{statusMap[record.status]}</Tag>
          </>
        )
      },
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
        <div
          style={{
            padding: 8,
          }}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Input
            ref={searchInput}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => {
              confirm()
              close()
            }}
            style={{
              marginBottom: 8,
              display: 'block',
            }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => {
                confirm()
                close()
              }}
              icon={<SearchOutlined />}
              size="small"
              style={{
                width: 90,
              }}
            >
              Search
            </Button>
            <Button
              onClick={() => {
                clearFilters()
                confirm()
                // close()
              }}
              size="small"
              style={{
                width: 90,
              }}
            >
              Reset
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                close();
              }}
            >
              close
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined
          style={{
            color: filtered ? '#1890ff' : undefined,
          }}
        />
      ),
      onFilter: (value, record) => Object.values(record).join('').toLowerCase().includes(value.toLowerCase()),
      onFilterDropdownOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
  
    },

    {
      title: '操作',
      render: (text, record) => (
        <Space direction="vertical" size="small" style={{ display: 'flex' }}>
          {record?.status === 'scan' && <Button onClick={() => {addInventory(record)}}>入库</Button>}
          <Button onClick={() => deleteItem(record)}>删除</Button>
          {record?.status === 'normal' && <Button onClick={() => bolt(record)}>闪电</Button>}
          {record?.status === 'bolt' && <Button onClick={() => returnToInventory(record)}>反库</Button>}
          {(record?.status === 'normal' || record?.status === 'bolt') && <Button onClick={() => sell(record)}>售出</Button>}
        </Space>
      )
    }
  ];
  return (<Table rowKey="_id" columns={columns} dataSource={items} onChange={onChange} pagination={false} 
  title={actionBar}
  footer={actionBar}/>
  );
}