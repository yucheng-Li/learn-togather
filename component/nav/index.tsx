import { useState, useEffect } from "react"
import {
    Box, Flex, Input, ChakraProvider, Tabs, Tab,
    TabList,
    TabPanels, TabPanel
} from "@chakra-ui/react"
import WalletNavBar from '@/component/wallet'

export default function Nav() {
    return (
        <ChakraProvider>
            <Box style={{
                display: 'flex', width: '100%', justifyContent: 'space-between',
                position: 'sticky',
                top: 0
            }}>
                <Box>
                    <a href="/word-list">单词列表</a>
                    <a href="/translation">翻译</a>
                </Box>
                <Box style={{
                }}>
                    <WalletNavBar />
                </Box>
            </Box>
        </ChakraProvider>
    )
}