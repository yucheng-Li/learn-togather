import { useState, useEffect } from "react"
import Web3 from 'web3';
import testAbi from './testAbi.json'
import tokenAbi from './tokenAbi.json'
import { Divider, List, Typography, Button, Modal } from 'antd';
import AddActivityForm from "@/component/form";
import { ethers } from "ethers";
import lf from "localforage"
import { get } from "http";
import dayjs from "dayjs";
import { useToast } from "@chakra-ui/react";

type ActivityData = {
    activityName: string;
    joinNumber: string;
    durationTime: string;
    joinMoney: string;
};

const contractAddress = '0x17C1449d0b3096cA79B1c46967dF1C1F54D8C1BB';
const web3 = new Web3('https://eth-goerli.g.alchemy.com/v2/N3B7qb-8dqboiJ6Ts3piNdt9FTiyomgs');
const contract = new web3.eth.Contract(testAbi, contractAddress);
const tokenContract = new web3.eth.Contract(tokenAbi, '0x0f4ee9631f4be0a63756515141281a3e2b293bbe');

export default function ActivityPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activityList, setActivityList] = useState([])
    const toast = useToast()
    const [joinState, setJoinState] = useState(false)

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const getEthereumContract = () => {
        const { ethereum } = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const transactionContract = new ethers.Contract(contractAddress, testAbi, signer);
        return transactionContract;
    }

    const data = [
        'Racing car sprays burning fuel into crowd.',
        'Japanese princess to wed commoner.',
        'Australian walks 100km after outback crash.',
        'Man charged over missing wedding girl.',
        'Los Angeles battles huge wildfires.',
    ];

    function Header() {
        return (
            <div>
                <Button onClick={showModal}>发起活动</Button>
            </div>
        )
    }

    async function formClick(value: ActivityData) {
        const { activityName, joinNumber, durationTime, joinMoney } = value
        // const { ethereum } = value;
        const wallet_address = await lf.getItem(`temp_address:current`)
        await getEthereumContract().createActivity(wallet_address, activityName, joinMoney, durationTime[0].valueOf() / 1000, durationTime[1].valueOf() / 1000, joinNumber)
        // console.log(53, res, wallet_address);
        const result = await contract.methods.getActivityList().call();
        console.log(66, result);
        handleCancel()
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await contract.methods.getActivityList().call();
                console.log(66, result);

                setActivityList(result)
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <List
                size="large"
                header={<Header />}
                bordered
                dataSource={activityList}
                renderItem={(item, index) => <List.Item>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div>
                            {/* {dayjs(Number(BigInt(item.endTime))).format('YYYY-MM-DD')} */}
                            {item?.activeName}
                        </div>
                        <div>
                            {/* {dayjs(Number(BigInt(item.endTime))).format('YYYY-MM-DD')} */}
                            已参与人数： 50人
                        </div>
                        <div>
                            {/* {dayjs(Number(BigInt(item.endTime))).format('YYYY-MM-DD')} */}
                            打卡完成人数：
                            <span style={{ color: 'red' }}>5人</span>
                        </div>
                        <div>
                            活动开始时间：-- -- --
                            活动结束时间：-- -- --
                        </div>
                    </div>
                    <div>
                        <div>
                            {/* {dayjs(Number(BigInt(item.endTime))).format('YYYY-MM-DD')} */}
                            奖金池：
                            <span style={{ color: 'red' }}>2500$</span>
                        </div>
                        <div>
                            预计获得瓜分奖金：
                            <span style={{ color: 'red' }}>50$</span>
                        </div>
                    </div>
                    <div>
                        <Button style={{ backgroundColor: 'green', color: 'white' }} onClick={async () => {
                            // const wallet_address = await lf.getItem(`temp_address:current`)
                            // await getEthereumContract().participate(index)
                            toast({
                                title: '参加成功',
                                status: 'success',
                                duration: 2000,
                                isClosable: true,
                                position: 'top'
                            })
                            setJoinState(true)
                        }}>{joinState ? "已参加" : "参加"}</Button>
                    </div>
                </List.Item>}
            />
            <Modal footer={null} title="发起活动" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <AddActivityForm formClick={formClick} />
            </Modal>
        </div>
    )
}