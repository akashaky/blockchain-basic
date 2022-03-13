import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import Decentragram from '../abis/Decentragram.json'
import Navbar from './Navbar'
import Main from './Main'

//Declare IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values


class App extends Component {
  
  async componentDidMount(){
    await this.loadWeb3();
    await this.loadBlockChainData();
  }

  async loadWeb3(){
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if(window.web3){
      window.web3 = new Web3(window.web3.currentProvider)
    } else{
      window.alert("No ethereum browser detected")
    }
  }

  async loadBlockChainData(){
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    console.log(accounts)
    this.setState({
      account: accounts[0]
    });
    //Network id 5777 for eth
    const networkId = await web3.eth.net.getId(); //getting 5777 dynamically
    const newtworkData = Decentragram.networks[networkId]; //finding eth network in abi
    if(newtworkData){
      const decentragram = web3.eth.Contract(Decentragram.abi, newtworkData.address);
      let imageCount = await decentragram.methods.imageCount().call();
      imageCount = (Number(imageCount.toString()))
      this.setState({decentragram: decentragram});
      this.setState({imageCount});
      // Load images
      for (var i = 1; i <= imageCount; i++) {
        const image = await decentragram.methods.images(i).call()
        console.log(image.hash)
        this.setState({
          images: [...this.state.images, image]
        })
      }
      this.setState({
        images: this.state.images.sort((a,b) => b.tipAmount - a.tipAmount )
      })
  
      this.setState({loading: false});
    }else {
      window.alert("Decentragram not connected");
    }

    console.log(accounts)
  }

  captureFile = (event) => {

    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  uploadImage = description => {
    console.log("Submitting file to ipfs...")

    //adding file to the IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if(error) {
        console.error(error)
        return
      }

      this.setState({ loading: true })
      this.state.decentragram.methods.uploadImage(result[0].hash, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false });
        this.setState({... this.state.images, result})
      })
    })
  }

   tipImageOwner = (id, tipAmount) => {
    this.setState({ loading: true })
    this.state.decentragram.methods.tipImageOwner(id).send({ from: this.state.account, value: tipAmount }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      decentragram: null,
      images: [],
      loading: true
    }
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main captureFile = {this.captureFile} uploadImage = {this.uploadImage} images = {this.state.images} tipImageOwner = {this.tipImageOwner}/>
          }
      </div>
    );
  }
}

export default App;