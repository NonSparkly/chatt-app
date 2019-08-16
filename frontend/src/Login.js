import React, { Component } from 'react'
import './Login.css'

export default class Login extends Component {

    constructor(props){
        super(props)
        this.state = {name: ""}
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(evt){
        this.setState({name: evt.target.value})
    }

    handleSubmit(evt) {        
        evt.preventDefault()
        this.props.func(this.state.name)
    }

    render() {

        return (
            <form className='Login' onSubmit={this.handleSubmit} >
                <input 
                    name='name' 
                    type='text'
                    value={this.state.name}
                    onChange={this.handleChange}
                    placeholder={this.props.join ? 'chatroom' :'username' }
                />
                <button>{this.props.join ? 'Join chatroom' : 'Login'}</button>
            </form>
        )
    }
}
