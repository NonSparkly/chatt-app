import React, { Component } from 'react'
import './Create.css'

export default class Create extends Component {

    constructor(props){
        super(props)
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(evt){
        evt.preventDefault()
        this.props.create()
    }


    render() {
        return (
            <div className='Create'>
                <h1 className='Create-message'>User does not exist! Would you like to make a new user named: {this.props.name}?</h1>
                <button className='Create-btn' onClick={this.handleClick}>Yes!</button>
            </div>
        )
    }
}
