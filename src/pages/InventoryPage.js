import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import { message, Modal, Input, Space, Button } from 'antd';
import ItemList from './ItemList.js'
import {localDB} from '../db/db.js'
import ImageByStyleColor from './ImageByStyleColor.js';


export default function InventoryPage() {
    const [messageApi, contextHolder] = message.useMessage();
    const [items, setItems] = useState([])
    const [isSellModalOpen, openSellModal] = useState(false)
    const [soldPrice, setSoldPrice] = useState('')
    const [sellItem, setSellItem] = useState({})
    const soldPriceRef = useRef()
    soldPriceRef.current = soldPrice

    const loadAllItems = async () => {
        const result = await localDB.allDocs({
            include_docs: true
        })
        setItems(result.rows.map(row => row.doc))
    }

    const deleteItem = async (doc) => {
        try {
            await localDB.remove(doc)
            await loadAllItems()
            messageApi.success("删除成功!")
        } catch (err) {
            messageApi.error("删除失败!", err.message)
        }
    }
    const bolt = async (doc) => {
        if (doc.status !== 'normal') {
            messageApi.error('闪电失败: 不能把非在库发送闪电')
            return
        }
        try {
            await localDB.put({
                ...doc,
                status: 'bolt'
            })
            await loadAllItems()
            messageApi.success("闪电成功!")
        } catch (err) {
            messageApi.error("闪电失败!", err.message)
        }
    }

    const returnToInventory = async (doc) => {
        if (doc.status !== 'bolt') {
            messageApi.error('返库失败: 不能把非闪电物品反库')
            return
        }
        try {
            await localDB.put({
                ...doc,
                status: 'normal'
            })
            await loadAllItems()
            messageApi.success("反库成功!")
        } catch (err) {
            messageApi.error("反库失败!", err.message)
        }
    }
    const sell = async (doc) => {
        openSellModal(true)
        setSellItem(doc)
    }
    const onSoldConfirm = async () => {
        if (sellItem.status !== 'normal' && sellItem.status !== 'bolt') {
            messageApi.error('物品状态不能出售!')
            return
        }
        try {
            await localDB.put({
                ...sellItem,
                status: 'sold',
                soldPrice: soldPriceRef.current 
            })
            await loadAllItems()
            messageApi.success("出售成功!")
        } catch (err) {
            messageApi.error("出售失败!", err.message)
        }
        openSellModal(false)
    }

    useEffect(() => {
        loadAllItems()
    }, [])
    
    
    return (<>
        
        <Space size="small" style={{ display: 'flex' }}>
            <Button>
                <Link to="/shoekeeper/scan">扫描</Link>
            </Button>
        </Space>

        {contextHolder}

        <Modal
            title={`${sellItem?.title}(${sellItem.size})`}
            style={{ top: 20 }}
            open={isSellModalOpen}
            onOk={onSoldConfirm}
            onCancel={() => openSellModal(false)}
        >
            <ImageByStyleColor styleColor={sellItem.styleColor}/>
            <Input placeholder="输入价格..." value={soldPrice} onChange={(e) => setSoldPrice(+e.target.value) } prefix="￥" type="number"/>
        </Modal>

        <ItemList items={items} mode="inventory" {...{items, deleteItem, bolt, returnToInventory, sell}}/>
    </>);
}