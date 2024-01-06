import { useState, useEffect } from "react"
import {
    Input, ChakraProvider, Flex, Box, Stack, Text, InputGroup, Card, CardHeader, Skeleton,
    Heading,
    CardBody,
    Button,
    InputLeftElement
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import Nav from "@/component/nav"
import CryptoJS from 'crypto-js';
import axios from 'axios';
import OpenAI from "openai";
import qs from 'qs'


interface TranslationResponse {
    returnPhrase: string[];
    query: string;
    errorCode: string;
    l: string;
    tSpeakUrl: string;
    web: WebEntry[];
    requestId: string;
    translation: string[];
    mTerminalDict: {
        url: string;
    };
    dict: {
        url: string;
    };
    webdict: {
        url: string;
    };
    basic: {
        exam_type: string[];
        "us-phonetic": string;
        phonetic: string;
        "uk-phonetic": string;
        wfs: {
            wf: {
                name: string;
                value: string;
            };
        }[];
        "uk-speech": string;
        explains: string[];
        "us-speech": string;
    };
    isWord: boolean;
    speakUrl: string;
}

interface WebEntry {
    value: string[];
    key: string;
}

interface TokenResponse {
    refresh_token: string;
    expires_in: number;
    session_key: string;
    access_token: string;
    scope: string;
    session_secret: string;
}

interface ExampleSentencesType {
    sentence: string;
    translate: string;
}

export default function TranslationPage({ addWord }) {
    function getBaiduTokenAjax(postData, fn1, fn2) {
        axios.post('/api-baidu/oauth/2.0/token', qs.stringify(postData))
            .then(function (data) {
                fn1 && fn1(data);
            })
            .catch(function (err) {
                fn2 && fn2(err.message);
            });
    }

    function extractArrayFromText(text) {
        console.log(22, text);
        const regex = /\[{.*?}\]/g;
        const matches = text.match(regex);

        if (matches) {
            const arrays = matches.map(match => JSON.parse(match));
            return arrays;
        }

        return [];
    }

    const TranslationBox = () => {
        const [translationData, setTranslationData] = useState<TranslationResponse>({});
        const [exampleSentences, setExampleSentences] = useState<ExampleSentencesType[]>([])
        const [wordValue, setWordValue] = useState("")
        const [sentencesLoadingState, setSentencesLoadingState] = useState(false)
        let baiduAPIToken = ''
        if (typeof window !== 'undefined') {
            // Perform localStorage action
            baiduAPIToken = localStorage.getItem("baiduApiToken") || ""
        }
        let audio_uk_refs = {}
        let audio_us_refs = {}

        function youdao(type: 'uk' | 'us') {
            if (type === 'uk') {
                audio_uk_refs.src = `https://dict.youdao.com/dictvoice?type=1&audio=${wordValue}`
                audio_uk_refs.play()
            } else {
                audio_us_refs.src = `https://dict.youdao.com/dictvoice?type=2&audio=${wordValue}`
                audio_us_refs.play()
            }
        }

        function strToJson(data) {
            const startIndex = data.indexOf("```json");
            const endIndex = data.lastIndexOf("```");
            const result = data.substring(startIndex + 8, endIndex);
            return result;
        }

        function getExampleSentencesByBaiduChatAI(access_token, word) {
            setSentencesLoadingState(true)
            axios.post(`/api-baidu/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/eb-instant`, {
                messages: [
                    {
                        "role": "user",
                        "content": `帮我为这个单词（${word}）造3个例句只返回一个数组结果必须用json代码的格式输出，数组的形式如下[{"sentence": "", "translate": ""},{"sentence": "", "translate": ""},{"sentence": "", "translate": ""}]返回给我`
                    }
                ]
            }, {
                params: {
                    access_token: access_token
                }
            })
                .then(function (data) {
                    const sentenceList = JSON.parse(strToJson(data.data.result));
                    setExampleSentences(sentenceList)
                    setSentencesLoadingState(false)

                })
                .catch(function (err) {
                    setSentencesLoadingState(false)
                    console.error(err);
                });
        }

        function handleChange(event) {
            setWordValue(event.target.value);
            searchWord(event.target.value)
            setExampleSentences([])
        };

        function handleKeyDown(event) {
            if (event.keyCode === 13) {
                const lan = checkLanguage(wordValue)
                if (lan === 'en') {
                    fetchData(wordValue, 'en', 'zh-CHS')
                    getExampleSentencesByBaiduChatAI(baiduAPIToken, wordValue)
                } else {
                    fetchData(wordValue, 'zh-CHS', 'en')
                }
            }
        }

        function searchWord(value) {
            const lan = checkLanguage(value)
            if (lan === 'en') {
                fetchData(value, 'en', 'zh-CHS')
            } else {
                fetchData(value, 'zh-CHS', 'en')
            }
        }

        function checkLanguage(text) {
            let ChineseChars = 0;

            for (let char of text) {
                if (char.charCodeAt(0) >= 0x4E00 && char.charCodeAt(0) <= 0x9FFF) {
                    ChineseChars++;
                }
            }

            if (ChineseChars > text.length / 2) {
                return 'zh'
            } else {
                return 'en'
            }
        }
        function truncate(q) {
            const len = q.length;
            if (len <= 20) return q;
            return q.substring(0, 10) + len + q.substring(len - 10, len);
        }
        function addWordToDB() {
            addWord(JSON.stringify({
                word: wordValue,
                sentence: exampleSentences
            }), wordValue)
        }
        const fetchData = async (word, from, to) => {
            const appKey = '4df75e665d4db795';
            const key = 'lrOb8Y4hG1YSSe40RzxqeBDoLblx9RQ2'; // 注意：暴露appSecret，有被盗用造成损失的风险
            var salt = (new Date).getTime();
            var curtime = Math.round(new Date().getTime() / 1000);
            var query = word;
            // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
            var str1 = appKey + truncate(query) + salt + curtime + key;
            var vocabId = '您的用户词表ID';
            //console.log('---',str1);

            var sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);

            try {
                const response = await axios.get('/api-text/api', {
                    params: {
                        q: query,
                        appKey,
                        salt,
                        from,
                        to,
                        sign,
                        signType: 'v3',
                        curtime,
                        vocabId,
                    },
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = response.data;
                const { translation, web } = data
                setTranslationData(data)
            } catch (error) {
                console.error(error);
            }
        };
        return (
            <ChakraProvider>
                <InputGroup justifyContent={"center"}>
                    <Box style={{
                        position: 'relative'
                    }}>
                        <Input style={{
                            width: 561,
                            borderRadius: 50,
                            paddingLeft: 48
                        }} size='lg' value={wordValue} onChange={handleChange} onKeyDown={handleKeyDown} />
                        <SearchIcon color='gray.300' style={{
                            position: 'absolute',
                            left: 16,
                            top: 16
                        }} />
                    </Box>
                </InputGroup>
                {
                    wordValue &&
                    <Box style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginTop: 32

                    }}>
                        <Card style={{
                            width: '60%',
                            minWidth: 561
                        }}>
                            {
                                translationData?.basic &&
                                <CardHeader>
                                    <Button onClick={addWordToDB}>添加单词</Button>
                                    <Box style={{ padding: '8px 0' }}>
                                        <Heading size='md'>{translationData?.returnPhrase?.map(item => <Text>{item}</Text>)}</Heading>
                                        <Text fontSize='1xl'>{translationData?.basic?.["us-phonetic"] && `/${translationData?.basic?.["us-phonetic"]}/`}</Text>
                                    </Box>

                                    <Button onClick={() => youdao('uk')}>
                                        <Text>英音</Text>
                                        <svg style={{ width: 24, height: 24 }} t="1703157021851" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5102" width="200" height="200"><path d="M827.3 134.9l60.3 60.3L782 300.8l105.6 105.6L782 512l105.6 105.6L782 723.2l105.6 105.6-60.3 60.3-165.9-166L767 617.5 661.3 512l105.6-105.6-105.6-105.6 166-165.9z m-277.5 24.7a21.3 21.3 0 0 1 4.8 13.5v678a21.3 21.3 0 0 1-34.9 16.5L294 682.6l-166 0.1A42.7 42.7 0 0 1 85.3 640V384a42.7 42.7 0 0 1 42.7-42.7h165.9l225.9-184.8a21.3 21.3 0 0 1 30 3z m-80.5 148.5L324.4 426.6H170.7v170.7h153.7l144.9 118.6V308.1z" p-id="5103"></path></svg>
                                        <audio ref={ref => audio_uk_refs = ref}></audio>
                                    </Button>
                                    <Button style={{ marginLeft: 8 }} onClick={() => youdao('us')}>
                                        <Text>美音</Text>
                                        <svg style={{ width: 24, height: 24 }} t="1703157021851" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5102" width="200" height="200"><path d="M827.3 134.9l60.3 60.3L782 300.8l105.6 105.6L782 512l105.6 105.6L782 723.2l105.6 105.6-60.3 60.3-165.9-166L767 617.5 661.3 512l105.6-105.6-105.6-105.6 166-165.9z m-277.5 24.7a21.3 21.3 0 0 1 4.8 13.5v678a21.3 21.3 0 0 1-34.9 16.5L294 682.6l-166 0.1A42.7 42.7 0 0 1 85.3 640V384a42.7 42.7 0 0 1 42.7-42.7h165.9l225.9-184.8a21.3 21.3 0 0 1 30 3z m-80.5 148.5L324.4 426.6H170.7v170.7h153.7l144.9 118.6V308.1z" p-id="5103"></path></svg>
                                        <audio ref={ref => audio_us_refs = ref}></audio>
                                    </Button>
                                </CardHeader>
                            }
                            <CardBody>
                                {translationData?.basic?.explains?.map((value, index) => (
                                    <Text key={index} fontSize='1xl'>{value}</Text>
                                ))}
                            </CardBody>
                        </Card>
                        <Card style={{
                            width: '60%',
                            minWidth: 561
                        }}>
                            <CardBody>
                                {exampleSentences.map((item, index) => (
                                    <Box key={index}>
                                        <Text key={item.sentence} fontSize='1xl'>{item.sentence}</Text>
                                        <Text key={item.sentence} fontSize='1xl'>{item.translate}</Text>
                                    </Box>
                                ))}
                                {
                                    sentencesLoadingState &&
                                    <Stack>
                                        <Skeleton height='20px' />
                                        <Skeleton height='20px' />
                                        <Skeleton height='20px' />
                                    </Stack>
                                }
                            </CardBody>
                        </Card>
                    </Box>
                }
            </ChakraProvider >
        )
    }

    useEffect(() => {
        getBaiduTokenAjax({
            "client_id": "oFc0M5Is5bfbYmxOYrgth08E",
            "client_secret": "IdlG5LFzhkvKWngGGnxCQV7RVRDqu8iA",
            "grant_type": "client_credentials"
        }, ({ data }: { data: TokenResponse }) => {
            console.log(245, data.access_token);
            localStorage.setItem("baiduApiToken", data.access_token)
            console.log("token 获取成功");
        }, (err: any) => {
            console.error(err)
        })
    }, [])
    return (
        <div>
            <div style={{
                marginTop: '200px',
                justifyContent: 'center'
            }}>
                <TranslationBox />
            </div>
        </div>
    )
}