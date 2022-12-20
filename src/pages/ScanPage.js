import * as React from 'react';
import { useState, useEffect } from 'react';
import { Html5Qrcode } from "html5-qrcode";
import axios from 'axios'
import { Button, Space } from 'antd';
import { Col, Divider, Row } from 'antd';

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


export default function ScanPage() {
    const [code, setCode] = useState('')
    const [items, setItems] = useState([])

    const scan = async () => {
        await initializeCamera()
        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode(/* element id */ "scanner");
        }
        html5QrCode.start(
            camera,
            {
                fps: 10,    // Optional, frame per seconds for qr code scanning
                qrbox: { width: 300, height: 200 },  // Optional, if you want bounded box UI
                showTorchButtonIfSupported: true
            },
            async (decodedText) => {
                html5QrCode.stop()
                setCode(decodedText)
                // do something when code is read
                // decodedText = '196152795809'
                // const item = await getProductInfoByGtin(decodedText)
            },
            (errorMessage) => {
                // setMessage([...message, 'html5qrcode scan failed' + errorMessage])
                // html5QrCode.stop()
                // parse error, ignore it.
            })
            .catch((err) => {
                html5QrCode.stop()
                // Start failed, handle it.
            });

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


    useEffect(() => {
        scan()
    }, [])

    return (<>
        <Row>
            <Col span={24}>
                <Button onClick={scan}>
                    扫描
                </Button>
            </Col>
        </Row>

        <Row>
            <Col span={24}>
                <div id="scanner" style={{
                    width: '100%',
                    height: '800px'
                }}
                >
                </div>
            </Col>
        </Row>

    </>);
}