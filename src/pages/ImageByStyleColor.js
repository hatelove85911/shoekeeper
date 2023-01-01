import { Image } from 'antd';
export default function ImageByStyleColor({styleColor=''}) {
    const [styleCode, colorCode] = styleColor.split("-")
    return (<Image src={`https://images.nike.com/is/image/DotCom/${styleCode}_${colorCode}?wid=100&hei=100&fmt=jpg&resMode=sharp&bgc=f8f8f8`}></Image>)
}
