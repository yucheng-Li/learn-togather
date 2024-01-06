import { useState, useEffect, useContext } from "react"
import {
    Box, Flex, Input, ChakraProvider, Tabs, useToast,
    TabList,
    Tab,
    TabPanels,
    TabPanel
} from "@chakra-ui/react"
import lf from "localforage"
import SDK from "weavedb-sdk"
import { isNil, map } from "ramda"
import ActivityPage from "@/pages/activity"
import TranslationPage from '@/pages/translation'
import WordListPage from "@/pages/word-list";
import WalletNavBar from "@/component/wallet";
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Breadcrumb, Layout, Menu, theme } from 'antd';

const { Header, Content, Sider } = Layout;

export default function HomePage() {
    const [user, setUser] = useState(null)
    const [initDB, setInitDB] = useState(false)
    const [db, setDb] = useState(null)
    const toast = useToast()
    const WEAVEDB_CONTRACT_TX_ID = "T16iG4NMYHsQrwdUYvVZdGYOxQTu0Fmdg7GxqTpvsCs"
    const contractTxId = WEAVEDB_CONTRACT_TX_ID

    const setupWeaveDB = async () => {
        const _db = new SDK({
            contractTxId,
        })
        await _db.init()
        setDb(_db)
        setInitDB(true)
    }

    const addWord = async (wordDetail, wordValue) => {
        addWordByDB(wordValue, wordDetail).then(async tx => {
            addRecordsByDB({
                word_id: tx.state.indexes.wordList.date.asc._.pop(),
                word: wordValue,
                memorized_count: 1
            })
        })
        // await getTasks()
    }

    function addWordByDB(word, wordDetail) {
        return db.add(
            {
                word: word,
                wordDetail: wordDetail,
                date: db.ts(),
                wordState: 0,
            },
            "wordList",
            user
        ).then((res) => {
            const { success } = res
            if (!success) {
                throw Error
            }
            return res
        }).catch(err => {
            toast({
                title: JSON.stringify(err),
                status: 'error',
                duration: 2000,
                isClosable: true,
            })
        })
    }

    async function addRecordsByDB({
        word_id,
        memorized_count,
        word
    }) {
        await db.add(
            {
                word_id,
                memorized_count,
                date: db.ts(),
                word
            },
            "records",
            user
        ).then((res) => {
            const { success } = res
            if (success) {
                console.log(58, res);

                toast({
                    title: '添加成功',
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                    position: 'top'
                })
            } else {
                throw Error
            }
        }).catch(err => {
            toast({
                title: JSON.stringify(err),
                status: 'error',
                duration: 2000,
                isClosable: true,
            })
        })
    }

    const checkUser = async () => {
        const wallet_address = await lf.getItem(`temp_address:current`)
        if (!isNil(wallet_address)) {
            const identity = await lf.getItem(
                `temp_address:${contractTxId}:${wallet_address}`
            )
            if (!isNil(identity))
                setUser({
                    wallet: wallet_address,
                    privateKey: identity.privateKey,
                })
        }
    }

    useEffect(() => {
        checkUser()
        setupWeaveDB()
    }, [])
    return (
        <div>
            <Tabs variant='soft-rounded' colorScheme='green'>
                <TabList justifyContent={'space-between'}>
                    <Box>
                        <Tab>翻译</Tab>
                        <Tab>单词列表</Tab>
                        <Tab>活动</Tab>
                    </Box>
                    <WalletNavBar />
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <TranslationPage addWord={addWord} />
                    </TabPanel>
                    <TabPanel>
                        <WordListPage db={db} user={user} />
                    </TabPanel>
                    <TabPanel>
                        <ActivityPage />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    )
}