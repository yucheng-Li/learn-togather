import SDK from "weavedb-sdk"
import { useState, useEffect } from "react"
import
WeavedbContext
  from '@/utils/globalState'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
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

  useEffect(() => {
    setupWeaveDB()
  }, [])

  return (
    <WeavedbContext.Provider value={db}>
      <Component {...pageProps} />
    </WeavedbContext.Provider>
  )
}
