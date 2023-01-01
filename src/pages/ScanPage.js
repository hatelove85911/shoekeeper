import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from "html5-qrcode";
import axios from 'axios'
import { Button, message, Space } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { Link } from "react-router-dom";
import ItemList from './ItemList.js'
import {localDB} from '../db/db.js'

let html5QrCode;
let camera;

const initializeCamera = async () => {
    camera = localStorage.getItem('cameraId');
    if (!camera) {
        const devices = await Html5Qrcode.getCameras()
        camera = devices.slice(-1)[0].id
        localStorage.setItem('cameraId', camera)
    }
}

const padStart = (str, n, padString = '0') => {
    const strObj = String(str);
    return (
      Array(strObj.length >= n ? 0 : n - strObj.length + 1).join(padString) +
      strObj
    );
  }

export default function ScanPage() {
    const [items, setItems] = useState([])
    // const [items, setItems] = useState([{
    //     "_id": uuidv4(),
    //     "gtinCode": "00196152795809",
    //     "styleColor": "315123-111",
    //     "size": "44",
    //     "fullPrice": 799,
    //     "costPrice": 479,
    //     "title": "Nike Air Force 1 classic white",
    //     "status": "scan"
    // }])
    const [isScan, setIsScan] = useState(false)
    const [messageApi, contextHolder] = message.useMessage();
    const itemsRef = useRef();
    itemsRef.current = items

    const bulkAddInventory = async () => {
        const scanItems = itemsRef.current.filter(item => item.status === 'scan').map(item => ({
            ...item,
            status: 'normal'
        }))

        if (scanItems.length === 0) {
            messageApi.warning("没有可以入库的物品!")
            return
        }
        try {
            await localDB.bulkDocs(scanItems)
            const remainingItems = itemsRef.current.filter(item => scanItems.every(({_id}) => item._id !== _id))
            setItems(remainingItems)
            messageApi.success(`${scanItems.length}件物品入库成功!`)
        } catch (err) {
            messageApi.error('批量入库失败!')
        }
    }
    const addInventory = async (doc) => {
        if (doc.status !== 'scan') {
            messageApi.error('入库失败')
            return
        }
        try {
            await localDB.put({
                ...doc,
                status: 'normal'
            })
            const filteredItems = itemsRef.current.filter(item => item._id !== doc._id)
            setItems(filteredItems)
            messageApi.success("入库成功!")
        } catch (err) {
            messageApi.error("入库失败!", err.message)
        }
    }
    const bulkBolt = async () => {
        const boltItems = itemsRef.current.filter(item => item.status === 'normal').map(item => ({
            ...item,
            status: 'bolt'
        }))

        if (boltItems.length === 0) {
            messageApi.warning("没有物品可以闪电发货!")
            return
        }
        try {
            await localDB.bulkDocs(boltItems)
            const remainingItems = itemsRef.current.filter(item => boltItems.every(({_id}) => item._id !== _id))
            setItems(remainingItems)
            messageApi.success(`${boltItems.length}件物品闪电发货成功!`)
        } catch (err) {
            messageApi.error('批量闪电发货失败!')
        }
    }
    const matchInventory = async () => {
        const result = await localDB.allDocs({
            include_docs: true
        })
        const inventoryItems = result.rows.map(row => row.doc)
        const matchedItems = itemsRef.current.map((item) => {
            const index = inventoryItems.findIndex(it => it.status === 'normal' && it.styleColor === item.styleColor && it.size === item.size)
            if (index !== -1) {
                const matchedItem = inventoryItems[index]
                inventoryItems.splice(index, 1)
                return matchedItem
            }
            return item
        })
        setItems(matchedItems)
    }
    const bulkClear = () => {
        setItems([])
        localStorage.removeItem('scanItems')
    }
    const deleteItem = async (doc) => {
        if (doc.status !== 'scan') {
            try {
                await localDB.remove(doc)
            } catch (err) {
                messageApi.error("删除失败!", err.message)
                return
            }
        }
        const filteredItems = itemsRef.current.filter(item => item._id !== doc._id)
        setItems(filteredItems)
        messageApi.success("删除成功!")
    }

    useEffect(() => {
        // try {
        //     const itemsStr = localStorage.getItem('scanItems')
        //     const items = JSON.parse(itemsStr) || []
        //     setItems(items)
        // } catch (error) {
        // }
    }, [])

    const scan = async () => {
        const isToScan = !isScan
        setIsScan(isToScan)
        if (isToScan) {
            await initializeCamera()
            if (!html5QrCode) {
                html5QrCode = new Html5Qrcode(/* element id */ "scanner");
            }
            html5QrCode.start(
                camera,
                {
                    fps: 20,    // Optional, frame per seconds for qr code scanning
                    qrbox: { width: 200, height: 100 },  // Optional, if you want bounded box UI
                    showTorchButtonIfSupported: true
                },
                async (decodedText) => {
                    setIsScan(false)
                    html5QrCode.stop()
                    const paddedBarCode = padStart(decodedText, 14)
                    try {
                        const item = await getProductInfoByGtin(paddedBarCode)
                        const allItems = [...itemsRef.current , {
                            ...item,
                            status: 'scan',
                            _id: uuidv4()
                        }]
                        localStorage.setItem('scanItems', JSON.stringify(allItems))
                        setItems(allItems)
                        messageApi.success('扫描成功!');

                    } catch (err) {
                        messageApi.error('扫描失败!', err.message);
                    }
                },
                (errorMessage) => {
                    // setMessage([...message, 'html5qrcode scan failed' + errorMessage])
                    // html5QrCode.stop()
                    // parse error, ignore it.
                })
                .catch((err) => {
                    setIsScan(false)
                    html5QrCode.stop()
                    messageApi.error('条形码扫描启动失败!', err.message);
                    // Start failed, handle it.
                });
        } else {
            html5QrCode.stop()
        }
    }
    const getProductInfoByGtin = async (gtinCode) => {
        const gtinCodeEncoded = encodeURIComponent(gtinCode)
        const url = `https://shoekeeperproxy.fly.dev/product_feed/threads/v2?filter=productInfo.skus.gtin(${gtinCodeEncoded})&filter=marketplace(CN)&filter=language(zh-Hans)&filter=exclusiveAccess(true,false)&filter=channelId(d9a5bc42-4b9c-4976-858a-f159cf99c647,15d92135-394e-487a-8afa-f6c8525c9ea9)`
        const result = await axios.get(url)
        console.log('result', result)
        const threadData = result.data.objects[0]
        console.log('product feed threads', threadData)

        const { styleColor } = threadData.productInfo[0].merchProduct
        const sku = threadData.productInfo[0].skus.find(sku => sku.gtin === gtinCode)
        const fullPrice = Number(threadData.productInfo[0].merchPrice.fullPrice)
        const costPrice = Number(Number(fullPrice * 0.6).toFixed(0))
        const item = {
            gtinCode,
            styleColor,
            size: sku.countrySpecifications[0].localizedSize,
            fullPrice,
            costPrice,
            title: threadData.productInfo[0].productContent.title
        }

        return item
    }


    return (<>
        <Space size="small" style={{ display: 'flex' }}>
            <Button onClick={scan}>
                {isScan ? '退出扫描' : '扫描'}
            </Button>
            <Button>
                <Link to="/shoekeeper/">返回</Link>
            </Button>
        </Space>
        { isScan && <div id="scanner" />
        }
        {contextHolder}
        <ItemList mode="scan" {...{items, bulkAddInventory, deleteItem, addInventory, bulkClear, matchInventory, bulkBolt}}/>
    </>);
}