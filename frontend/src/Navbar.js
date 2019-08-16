import React, { Component } from 'react'
import {NavLink} from 'react-router-dom'
import './Navbar.css'

export default class User extends Component {
    render() {
        const chatNavs = this.props.chats.map( chat => 
            <NavLink 
                className='Navbar-Navlink'
                to={`/user/${this.props.name}/chats/${chat.id}`} 
                key={chat.id}
                style={{backgroundColor: chat.color}}
                >{chat.name}</NavLink>
        )

        return (
            <div className='Navbar'>
                <div className='Navbar-banner'>Welcome {this.props.name}</div>
                {chatNavs}
                <NavLink className='Navbar-Navlink' to={`/user/${this.props.name}/chats`}>Join chatroom!</NavLink>
            </div>
        )
    }
}
