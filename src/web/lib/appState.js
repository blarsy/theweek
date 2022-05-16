import { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Logger, LogLevel } from '@ethersproject/logger'
import { Button, Snackbar, Alert } from '@mui/material'
import { isFacilitator  } from './lockerContractFacade'

const AppContext = createContext();

let ethereum
let provider

export function AppWrapper({ children }) {
  const tryConnect = async () => {
    try {
        ensureWalletInitialized()
        provider = new ethers.providers.Web3Provider(ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const walletAddress = await signer.getAddress()
        localStorage.setItem('walletAddress', walletAddress)
        const signerIsFacilitator = await isFacilitator(signer)
        mergeWithState(state, { 
          walletAddress,
          provider,
          signer, 
          autoConnecting: false, 
          isFacilitator: signerIsFacilitator,
          errorMsg: null, buttonAction: null, buttonCaption: null
        })
    } catch (ex) {
        console.log(ex)
        let errorMsg = 'There was a failure connecting to our smart contract.'

        if(ex.code === 'CALL_EXCEPTION') {
          errorMsg = 'Failed to contact our smart contract. Is your wallet connected to the Polygon network ?'
        }
        mergeWithState(state, { 
          autoConnecting: false, 
          errorMsg,
          buttonCaption: 'Try again', buttonAction: tryConnect,
          triedConnecting: true // Prevents endlessly retrying to connect
        })
    }
  }
  const mergeWithState = (oldState, newState) => {
    setState({...oldState, ...newState})
  }
  const setError = (oldState, msg, buttonCaption, buttonAction) => {
    const errorData = {
      errorMsg: msg
    }
    if(buttonCaption && buttonAction) {
      errorData.buttonCaption = buttonCaption
      errorData.buttonAction = buttonAction
    }
    mergeWithState(oldState, errorData)
  }

  const [state, setState] = useState({
    walletAddress: null,
    tryConnect,
    mergeWithState,
    autoConnecting:false,
    setError,
    currentView: 0,
  })
  useEffect(async () => {
    if(!state.walletAddress && localStorage.getItem('walletAddress') && !state.autoConnecting && !state.errorMsg && !state.triedConnecting) {
      mergeWithState(state, { autoConnecting: true })
      await state.tryConnect()
    }
  })

  const ensureWalletInitialized = () => {
    if(!ethereum){
      ethereum = window.ethereum
      ethereum.on('accountsChanged', tryConnect)
      ethereum.on('chainChanged', tryConnect)
      Logger.setLogLevel(LogLevel.DEBUG)
    }
  }

  const dismissErrorMsg = () => setError(state)

  return (
    <AppContext.Provider value={[state, setState]}>
      <Snackbar
        open={!!state.errorMsg}
        autoHideDuration={60000}
        onClose={dismissErrorMsg}
        message={state.errorMsg}
      >
        <Alert onClose={dismissErrorMsg} severity="error">
            {state.errorMsg}
            {state.buttonCaption && <Button color="secondary" size="small" onClick={state.buttonAction}>
              {state.buttonCaption}
            </Button>}
        </Alert>
      </Snackbar>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}