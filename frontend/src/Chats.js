import React, { Component } from 'react'
import Navbar from './Navbar'
import Chat from './Chat'

import './Chats.css'

export default class Chats extends Component {
    
    render() {
        const chats = this.props.chats.map(chat => 
            <Chat
                edit={this.props.editChat}
                delete={this.props.deleteChat}
                key={chat.id}
                id={chat.id}
                name={chat.name}
                color={chat.color}
                messages={this.props.messages.length ? this.props.messages.filter(m => m.chat === chat.id): []} 
                send={this.props.send}
                get={this.props.getMessages}
                self={this.props.self}
            />)
        return (
            <div className="Chats">
                {chats}
            </div>
        )
    }
}
