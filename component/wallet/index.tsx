import { useState, useEffect } from "react"
import { Box, Flex, Input, ChakraProvider } from "@chakra-ui/react"
import { isNil, map } from "ramda"
import { ethers } from "ethers"
import SDK from "weavedb-sdk"
import lf from "localforage"


export default function WalletNavBar() {
    const [user, setUser] = useState(null)
    const WEAVEDB_CONTRACT_TX_ID = "T16iG4NMYHsQrwdUYvVZdGYOxQTu0Fmdg7GxqTpvsCs"
    const contractTxId = WEAVEDB_CONTRACT_TX_ID
    const [db, setDb] = useState(null)
    const [initDB, setInitDB] = useState(false)


    const setupWeaveDB = async () => {
        const _db = new SDK({
            contractTxId,
        })
        await _db.init()
        setDb(_db)
        setInitDB(true)
    }

    const logout = async () => {
        if (confirm("Would you like to sign out?")) {
            await lf.removeItem("temp_address:current")
            setUser(null, "temp_current")
        }
    }

    const login = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        await provider.send("eth_requestAccounts", []).then((res) => {
            console.log(36, res)
        }
        ).catch((err) => {
            console.log(39, err)
        }
        )
        const wallet_address = await provider.getSigner().getAddress()
        let identity = await lf.getItem(
            `temp_address:${contractTxId}:${wallet_address}`
        )
        let tx
        let err
        if (isNil(identity)) {
            console.log(49, wallet_address);

            ; ({ tx, identity, err } = await db.createTempAddress(wallet_address))
            const linked = await db.getAddressLink(identity.address)
            if (isNil(linked)) {
                alert("something went wrong")
                return
            }
        } else {
            await lf.setItem("temp_address:current", wallet_address)
            setUser({
                wallet: wallet_address,
                privateKey: identity.privateKey,
            })
            return
        }
        if (!isNil(tx) && isNil(tx.err)) {
            identity.tx = tx
            identity.linked_address = wallet_address
            await lf.setItem("temp_address:current", wallet_address)
            await lf.setItem(
                `temp_address:${contractTxId}:${wallet_address}`,
                JSON.parse(JSON.stringify(identity))
            )
            setUser({
                wallet: wallet_address,
                privateKey: identity.privateKey,
            })
        }
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

        <Flex p={3}>
            <Box flex={1} />
            <Flex
                bg="#111"
                color="white"
                py={2}
                px={6}
                sx={{
                    borderRadius: "5px",
                    cursor: "pointer",
                    ":hover": { opacity: 0.75 },
                }}
            >
                {!isNil(user) ? (
                    <Box onClick={() => logout()}>{user.wallet.slice(0, 7)}</Box>
                ) : (
                    <Box onClick={() => login()}>Connect Wallet</Box>
                )}
            </Flex>
        </Flex>
    )
}