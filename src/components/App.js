import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import Decentragram from '../abis/Decentragram.json'
import Navbar from './Navbar'
import Main from './Main'
import ipfsClient from 'ipfs-http-client'

const ipfs = ipfsClient({host: 'ipfs.infura.io', port: '5001', protocol: 'https'})

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      decentragram: null,
      images: [],
      couter: 0,
      loading: true,
    }
  }

  async componentWillMount() {
    this.loadWeb3()
    this.loadBlockchainData()
  }

  async loadWeb3() {
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert("please install Metamask")
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0]});

    const networkId = await web3.eth.net.getId()
    const network = Decentragram.networks[networkId]
    if(network) {
      const decentragram = web3.eth.Contract(Decentragram.abi, network.address)
      this.setState({decentragram})
      console.log("🚀 ~ file: App.js ~ line 49 ~ App ~ loadBlockchainData ~ decentragram", decentragram)

      const counter = await decentragram.methods.couter().call()
      this.setState({counter})

      for(let i = 1; i <= counter; i++) {
        const image = await decentragram.methods.images(i).call()
        this.setState({
          images: [...this.state.images, image]
        })
      }

      this.setState({loading: false})
    } else {
      alert('Decentragram not deployed on this network')
    }
  }

  captureFile = event => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({buffer: Buffer(reader.result)})
      console.log('buffer: ', this.state.buffer);
    }

  }

  uploadImage = description => {
    ipfs.add(this.state.buffer, (err, result) => {
      console.log('ipfs result: ', result);
      if(err) {
        console.error(err);
        return
      }
      this.setState({loading: true})
      this.state.decentragram.methods.uploadImage(result[0].hash, description).send({from: this.state.account}).on('transactionHash', (hash) => {
        this.setState({loading: false})
      })
    })

  }

  tipImageOwner = async (id, tipAmount) => {
    this.setState({loading: true})


    this.state.decentragram.methods.tipImageOwner(id).send({from: this.state.account, value: tipAmount}).on('transactionHash', (hash) => {
        this.setState({loading: false})
      })
  }

  

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              captureFile={this.captureFile}
              uploadImage={this.uploadImage}
              tipImageOwner={this.tipImageOwner}
              images={this.state.images}
            />
          }
      </div>
    );
  }
}


export default App;