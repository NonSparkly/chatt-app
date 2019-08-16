import React, { Component } from 'react'
import './Chat.css'

export default class Chat extends Component {

    constructor(props){ 
        super(props)

        this.state = {
            edit: false,
            message: '', 
            chatName: this.props.chat.name,
            color: this.props.chat.color || '' 
        }

        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleEdit = this.handleEdit.bind(this)
        this.handleDelete = this.handleDelete.bind(this)
        this.toggleEdit = this.toggleEdit.bind(this)
    }
    componentWillUnmount(){
        clearInterval(this.state.intervalId)
    }

    handleChange(evt){
        this.setState({[evt.target.name]: evt.target.value})
    }

    handleSubmit(evt){
        evt.preventDefault()
        this.props.send(this.state.message, this.props.id)
        this.setState({message: ''})
    }

    handleEdit(evt){
        evt.preventDefault()
        this.props.edit(this.props.id, this.state.chatName, this.state.color)
    }

    handleDelete(evt){
        evt.preventDefault()
        this.props.delete(this.props.id)
    }

    toggleEdit(evt){
        this.setState(st => ({edit: !st.edit}))
    }

    render() {
        const banner = this.state.edit ? 
            <div className='Chat-title' style={{backgroundColor: this.props.chat.color}}>
                <form onSubmit={this.handleEdit}>
                    <input name='chatName' onChange={this.handleChange} type='text' value={this.state.chatName} />
                    <input name='color' onChange={this.handleChange} type='text' value={this.state.color || ''} />
                    <button>Edit</button>
                </form>
                <button onClick={this.handleDelete}>Delete Chat</button>
                <button onClick={this.toggleEdit}>Cancel</button>
            </div> : 
            <div className='Chat-title'  style={{backgroundColor: this.props.chat.color}}>
                <h2 onClick={this.toggleEdit}>{this.props.chat.name}</h2>                
            </div>
        let messages = [];

        this.props.messages.forEach(el => {                               
            
            if(el.chat === this.props.id){
                messages.push(el)
            }
        })     

        messages = messages.map(message => 
            <div key={message.date} className={message.by === this.props.self ? 'Message Self' : 'Message'}>
                <div className='Message-meta'>
                    <p className='Message-name'>{message.by}</p>
                    <p className='Message-time'>{message.date.slice(11, 16)}</p>
                </div>
                <p 
                    className='Message-text'
                    style={{backgroundColor: this.props.chat.color}}
                >{message.message}</p>
            </div>
        )
        return (
            <div className="Chat">
                {banner}
                
                <div className='Chat-messages'>                    
                    {this.props.messages && messages}
                </div>
                <form className='Chat-write' onSubmit={this.handleSubmit}>
                    <input 
                        name='message' 
                        type='text'
                        value={this.state.message}
                        onChange={this.handleChange}
                        placeholder='Write something!' 
                    />
                    <button>Send</button>
                </form>
            </div>
        )
    }
}
