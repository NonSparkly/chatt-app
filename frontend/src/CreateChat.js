import React, { Component } from 'react'

export default class CreateChat extends Component {

    constructor(props){
        super(props)
        this.state = {name: props.name, color: ''}
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(evt){
        console.log(evt.target.name)
        this.setState({ [evt.target.name]: evt.target.value })
    }

    handleSubmit(evt) {        
        evt.preventDefault()
        this.props.create(this.state.name, this.state.color)
    }

    render() {
        return (
            <div className='Create'>
                <h1>Create a new chat</h1>
                <form onSubmit={this.handleSubmit}>
                    <input name='name' type='text' onChange={this.handleChange} value={this.state.name} placeholder='Name of chat' required/>
                    <input name='color' type='color' onChange={this.handleChange} value={this.state.color} placeholder='Chat hex color'/>
                    <button>Make chat</button>
                </form>
            </div>
        )
    }
}
