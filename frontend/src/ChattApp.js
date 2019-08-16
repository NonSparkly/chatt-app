import React, { Component } from 'react'
import {Route, Switch, Redirect} from 'react-browser-router'
import Login from './Login'
import CreateUser from './CreateUser'
import CreateChat from './CreateChat';
import Chat from './Chat'
import Navbar from './Navbar'
import './ChatApp.css'

const WSBACKEND = process.env.REACT_APP_WSBACKEND
console.log(WSBACKEND)
var socket;

export default class ChattApp extends Component {

    constructor(props){
        super(props)
        this.state = {
            loggedIn: false, 
            name: '', 
            chats: [],
            messages: new Set(),
            to: ''}
        
        this.redirect = this.redirect.bind(this)
        this.login = this.login.bind(this)
        this.joinChat = this.joinChat.bind(this)
        this.createUser = this.createUser.bind(this)
        this.createChat = this.createChat.bind(this)
        this.sendMessage = this.sendMessage.bind(this)
        this.getMessages = this.getMessages.bind(this)
        this.getChats = this.getChats.bind(this)
        this.editChat = this.editChat.bind(this)
        this.deleteChat = this.deleteChat.bind(this)
    }
    
    // Redirect helper method TODO find a better way to do this
    redirect(to){
        this.setState({redirect: true, to: to}, () => {
            this.setState({redirect: false, to: ''})
        })
    }

    async login(name){
        let data
        await fetch('/user/' + name)
            .then(response=> response.json())
            .then(json => data = json)

        // if user does not exist, redirect to /user/new
        if(data){
            console.log(data)
            if(data.redirect === 'new'){
                this.setState({name: name}, () => this.redirect('/user/new'))
            } else { // if user exists, redirect to /user/:userId
                this.setState({login: true, name: name}
                    , () => {
                        socket = new WebSocket(WSBACKEND , 'echo-protocol')
                        socket.addEventListener('open', () => {
                            socket.send(JSON.stringify({name: this.state.name}))
                            socket.addEventListener('message', (data => {
                                console.log(data.data)
                                if(this.state.chats.some(chat => {
                                    return chat.id === JSON.parse(data.data).chatId
                                })){
                                    console.log(this.state.messages)
                                    let newMessage = JSON.parse(data.data).message
                                    this.setState(st => (
                                        {messages: [...st.messages, newMessage]}
                                    ), console.log(this.state.messages))
                                }
                            }))
                        })
                        
                        
                        this.getChats()
                        this.redirect('/user/' + name)
                    }
                )
            }
        }
    }
    
    async createUser(){
        console.log(this.state.name)

        await fetch('/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: this.state.name})
        })
            .then( response => response.json())
            .then( data =>{
                console.log(data)
                this.login(data.redirect)
            }).catch( err => {
                console.log(err)
            })
            
    }

    async sendMessage(message, chatId){
        message = {message: message}
        await fetch('/user/' + this.state.name + '/chats/' + chatId,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        })
        .catch( err => {
            console.log(err)
        })
    }
    

    async getMessages(chatId){
        if(this.state.name){
            await fetch('/user/' + this.state.name + '/chats/' + chatId + '/show')
                .then(response => response.json())
                .then(data => {
                    let newMessages = new Set(data.messages)
                    let union = new Set(this.state.messages)
                    for (let el of newMessages){
                        union.add(el)
                    }
                    this.setState({
                        messages: union
                    })
                }).catch(err => {
                    console.log(err)
            })
        }
    }

    async getChats(){
        if(this.state.name){            
            await fetch('/user/' + this.state.name + '/chats')
                .then(response => response.json())
                .then(data => {                        
                    if(data.chats){
                        this.setState({chats: data.chats}, () => {
                            this.state.chats.forEach(chat => {
                                this.getMessages(chat.id)
                            })
                        })                    
                    }else if(data.redirect) {
                        this.redirect(data.redirect)
                    }
                }).catch(err =>  
                    console.log(err)
                )
        }
    }

    async joinChat(name){
        await fetch('/user/' + this.state.name + '/chats/' + name)
            .then(response => response.json())
            .then(async data => {
                console.log(data)
                await this.getChats()
                this.setState({newChatName: name}, () => {
                    if(data.redirect){this.redirect(data.redirect)}
                })  
            })

    }

    async createChat(name, hex){
        const chat = {name: name, color: hex, owner: this.state.name, members: [this.state.name]}
        await fetch('/user/' + this.state.name + '/chats' ,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chat)
        })
            .then(response => response.json())
            .then(async data => {
                console.log(data)
                await this.getChats()
                this.setState({newChatName: ''}, () => {                    
                    this.redirect(data.redirect)
                })
            }
            ).catch( err => {
                console.log(err)
            })
    }

    async editChat(id, name, hex){
        const chat = {name: name, color: hex}
        await fetch('/user/' + this.state.name + '/chats/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chat)
        }).then( response => {
            console.log(response.json())
            this.getChats()
            
        }).catch(err => {
            console.log(err)
        })
    }

    async deleteChat (id){
        console.log(id)
        await fetch('/user/' + this.state.name + '/chats/' + id, {
            method: 'DELETE'
        }).then( response => {
            console.log(response.json())
            this.getChats()
            this.redirect('/user/' + this.state.name)
        }).catch( err => {
            console.log(err)
        })
    }

    render() {

        return (
            <div className="ChatApp">
                {this.state.login ? <Navbar name={this.state.name} chats={this.state.chats}/> : <Redirect to='/' /> }                
                <Switch>
                    <Route exact path='/' render={() => <Login func={this.login} join={false} />} />
                    <Route exact path='/user/new' render={() => <CreateUser create={this.createUser} name={this.state.name}/>}/>
                    <Route exact path='/user/:user' render={({match}) => <Redirect to={`/user/${match.params.user}/chats`} />} />
                    <Route 
                        exact 
                        path='/user/:user/chats' 
                        render={() => <Login func={this.joinChat} join={true} /> } 
                    />
                    <Route
                        exact path='/user/:userId/chats/new'
                        render={({match}) => (<CreateChat create={this.createChat} name={this.state.newChatName} />)}
                    />
                    {this.state.chats.length && <Route 
                        exact path='/user/:user/chats/:chat'
                        render={({match}) => {
                            let chat = this.state.chats.find(chat => chat.id === match.params.chat)                            
                                                
                            
                            return(
                                <Chat
                                    id={match.params.chat}
                                    chat={chat}
                                    edit={this.editChat}
                                    delete={this.deleteChat}
                                    messages={this.state.messages} 
                                    send={this.sendMessage}
                                    get={this.getMessages}  
                                    self={this.state.name}
                                />)
                            }} 
                    />}
                </Switch>
                {this.state.redirect && <Redirect to={this.state.to}/>}
            </div>
        )
    }
}