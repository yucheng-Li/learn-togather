import { useState, useEffect } from "react"
import Web3 from 'web3';
import testAbi from './testAbi.json'
import { Divider, List, Typography, Button, Modal } from 'antd';
import AddActivityForm from "@/component/form";

const contractAddress = '0x8F896bd4Ec7AC0B3CE4f0124D195f754d48b161A';
const web3 = new Web3('https://eth-goerli.g.alchemy.com/v2/N3B7qb-8dqboiJ6Ts3piNdt9FTiyomgs');
const contract = new web3.eth.Contract(testAbi, contractAddress);

export default function ActivityPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await contract.methods.getActivityList().call();
                console.log(52, result);
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
                dataSource={data}
                renderItem={(item) => <List.Item>
                    <div>
                        {item}
                    </div>
                    <div>
                        <Button onClick={() => {
                            contract.methods.createActivity("0x15FC368F7F8BfF752119cda045fcE815dc8F053A", 50, 1000000000, 1000000000, 20).send({
                                from: '0x5a8b0f8a9c8f8b5e0f1f4e7b8e5b5f7e1d9b8f1e',
                                value: web3.utils.toWei('0.1', 'ether'),
                            }).then((result) => {
                                console.log(65, result);
                            }).catch((error) => {
                                console.error(error);
                            });
                        }}>参加</Button>
                    </div>
                </List.Item>}
            />
            <Modal footer={null} title="发起活动" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <AddActivityForm />
            </Modal>
        </div>
    )
}