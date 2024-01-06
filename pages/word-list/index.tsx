import React, { useState, useEffect, useContext } from "react"
import {
    Box, Flex, Input, ChakraProvider, Text, PopoverTrigger, PopoverContent, CardBody, Card,
    Stack,
    Button
} from "@chakra-ui/react"
import Nav from "@/component/nav"
import { LaptopOutlined, NotificationOutlined, UserOutlined, LoadingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Breadcrumb, Layout, Menu, theme, Skeleton, Popover } from 'antd';
import DatePicker from '@/component/datePicker'
import { RepeatIcon } from '@chakra-ui/icons'
import styles from './wordList.module.css'

type WordRecord = {
    word_id: string;
    memorized_count: number;
    date: string;
    word: string;
}

interface ExampleSentencesType {
    sentence: string;
    translate: string;
}

interface Sentence {
    sentence: string;
    translate: string;
}

interface WordDetail {
    word: string;
    sentence: Sentence[];
}

interface Data {
    wordDetail: string;
    date: string;
    wordState: number;
}

interface WordData {
    id: string;
    setter: string;
    data: Data;
}

const { Header, Content, Sider } = Layout;

export default function WordListPage({ db, user }: {}) {
    const [wordList, setTasks] = useState([])
    const [listLoading, setListLoading] = useState(false)
    const [sentence, setSentence] = useState<ExampleSentencesType[]>([])
    const [openPopover, setOpenPopover] = useState(false);
    const [onClickWord, setOnClickWord] = useState('')
    const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() });
    let audio_uk_refs = {}
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const getTasks = async () => {
        setListLoading(true)
        getDateByDB()
        setTasks(await getWordListByDB())
    }

    const getWordListByDB = async () => {
        return await db.cget("records", ["date", "desc"]).then((res = []) => {
            setListLoading(false)
            return res
        }).catch(err => {
            setListLoading(false)
            console.error(err);
            return []
        })
    }

    function playVoice(word) {
        audio_uk_refs.src = `https://dict.youdao.com/dictvoice?type=1&audio=${word}`
        audio_uk_refs.play()
    }

    async function getWordByDB(word) {
        return db.cget("wordList", ["word"], [
            "word", "==", word
        ]).then(res => {
            if (res.length === 0) return
            console.log(83, JSON.parse(res[0].data.wordDetail).sentence);
            setSentence(JSON.parse(res[0].data.wordDetail).sentence)
        })
    }

    async function getDateByDB(start, end) {
        setListLoading(true)
        return await db.cget("records", ["date"], [
            "date", ">", start,
        ], [
            "date", "<", end,
        ]).then(res => {
            setListLoading(false)
            console.log(103, res);

            setTasks(res || [])
            return res
        }).catch(err => {
            setListLoading(false)
            console.error(err);
            return []
        })
    }

    function wordClick(word, memorized_count, doc_id) {
        setOnClickWord(word)
        setSentence([])
        if (!openPopover) {
            playVoice(word)
            updateWordState(memorized_count - 1, doc_id)
        }
        getWordByDB(word)
        setOpenPopover(true)
    }

    async function updateWordState(wordState, doc_id) {

        // wordState 只能在 1-4 ， 小于 1 的话，就是 1， 大于 4 的话，就是 4
        wordState = wordState < 1 ? 1 : wordState > 4 ? 4 : wordState
        console.log(124, wordState, doc_id);
        return await db.update({ memorized_count: wordState }, "records", doc_id, user).then(res => {
            console.log(131, res);

            if (res.success) {
                getDateByDB(dateRange.start / 1000, dateRange.end / 1000)
            }
        }).catch(err => {
            console.error(err);
        })
    }

    function MemorizedCountStateCom({ memorized_count = 5, doc_id }: { memorized_count: number }) {
        const stateColor = {
            1: '#ff7875',
            2: '#ffa940',
            3: '#ffd666',
            4: '#bae637',
            5: '#D9D9D9FF',
        }

        const handleUpdateWordState = () => {
            updateWordState(memorized_count + 1, doc_id);
        }

        return (
            <Button style={{
                width: '100%',
            }}
                onClick={handleUpdateWordState}
            >
                <Box style={{
                    width: '40%',
                    height: '100%',
                    backgroundColor: stateColor[memorized_count],
                    borderRadius: 8,
                }} />
            </Button>
        )
    }
    const getTimeFilter = (datePickerValue: '今天' | '前一天' | '前两天' | '前三天' | '前四天' | '前五天') => {
        const days = ['今天', '前一天', '前两天', '前三天', '前四天', '前五天'].indexOf(datePickerValue);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        return { start: startDate.getTime() / 1000, end: endDate.getTime() / 1000 };
    }

    const Tasks = () => {
        return wordList?.map((wordRecord, index) => {
            const { id } = wordRecord
            const { word, memorized_count }: WordRecord = wordRecord.data
            return (<Flex
                style={{
                    width: 150,
                    padding: 4,
                    margin: "2px 4px",
                    flexDirection: 'row'
                }}
                flexDirection={'column'}
                key={index}
                sx={{ border: "1px solid #ddd", borderRadius: "5px" }}
                p={3}
                my={1}
            >
                <Popover
                    content={
                        <Text>
                            {
                                sentence?.map((item, index) => {
                                    return (
                                        <Box key={index}>
                                            <Text>{item.sentence}</Text>
                                            <Text>{item.translate}</Text>
                                        </Box>
                                    )
                                })
                            }
                        </Text>
                    }
                    trigger={['click']}
                    onVisibleChange={setOpenPopover}
                    open={onClickWord === word ? openPopover : false}
                    placement="right"
                >
                    <Box style={{
                        width: "100%",
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column'
                    }}>
                        <Button
                            onClick={() => wordClick(word, memorized_count, id)}
                            style={{
                                width: "100%",
                                fontSize: 16
                            }}>
                            {word}
                        </Button>
                    </Box>
                </Popover>
                <MemorizedCountStateCom memorized_count={memorized_count} doc_id={id} />
            </Flex>
            )
        })
    }

    /**
     * @param {string} datePickerValue - 日期选择器的值，可以是 '今天'、'前一天'、'前两天'、'前三天'、'前四天' 或 '前五天'
     */
    function TimeFilterButton(datePickerValue: { datePickerValue: '今天' | '前一天' | '前两天' | '前三天' | '前四天' | '前五天' }) {
        return (
            <Button
                style={{
                    border: "1px solid #ddd", borderRadius: "5px",
                    padding: "4px 12px",
                    margin: "2px 4px",
                }}
                onClick={() => {
                    const { start, end } = getTimeFilter(datePickerValue.datePickerValue);
                    getDateByDB(start, end)
                    setDateRange({ start: new Date(start * 1000), end: new Date(end * 1000) })
                }}
            >
                {datePickerValue.datePickerValue}
            </Button>
        )
    }

    function dayPicker(date) {
        function generateStartEndTimestamp(inputTimestamp) {
            // Convert input timestamp to date object
            let date = new Date(inputTimestamp * 1000);

            // Set the hours, minutes, seconds, and milliseconds to get the start of day
            let startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

            // Similarly, set the hours, minutes, seconds, and milliseconds to get the end of day
            let endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

            // Convert the dates back to timestamp (seconds)
            let result = {
                start: Math.floor(startOfDay.getTime() / 1000),
                end: Math.floor(endOfDay.getTime() / 1000)
            };

            return result;
        }
        const { start, end } = generateStartEndTimestamp(date)
        console.log(277, start, end);

        getDateByDB(start, end)
        setDateRange({ start: new Date(start * 1000), end: new Date(end * 1000) })
    }

    useEffect(() => {
        if (db) {
            getTasks()
        }
    }, [db])


    return (
        <div>
            <Layout >
                <Layout style={{ padding: '24px 24px 24px' }}>
                    <Content
                        style={{
                            minWidth: 300,
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Box>
                            <Box>
                                <TimeFilterButton datePickerValue="今天" />
                                <TimeFilterButton datePickerValue="前一天" />
                                <TimeFilterButton datePickerValue="前两天" />
                                <TimeFilterButton datePickerValue="前三天" />
                                <TimeFilterButton datePickerValue="前四天" />
                                <TimeFilterButton datePickerValue="前五天" />
                            </Box>
                            <Box
                                style={{
                                    padding: 8,
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                                onClick={getTasks}
                            >
                                <Text>
                                    {dateRange.start.getFullYear()}-{dateRange.start.getMonth() + 1}-{dateRange.start.getDate()} 至
                                    {dateRange.end.getFullYear()}-{dateRange.end.getMonth() + 1}-{dateRange.end.getDate()}
                                </Text>
                                <Box style={{ marginLeft: 8, display: 'flex' }}>
                                    {
                                        listLoading ?
                                            <LoadingOutlined /> : <RepeatIcon />
                                    }
                                </Box>
                            </Box>
                        </Box>
                        {
                            listLoading ?
                                <Skeleton active={true} /> :
                                <Box
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    <Tasks />
                                </Box>
                        }
                        <audio ref={ref => audio_uk_refs = ref}></audio>
                    </Content>
                    <Sider
                        width={350}
                        style={{
                            padding: 24,
                            marginLeft: 24,
                            minHeight: 280,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <DatePicker dayPicker={dayPicker} />
                    </Sider>
                </Layout>
            </Layout>

        </div>
    )
}

