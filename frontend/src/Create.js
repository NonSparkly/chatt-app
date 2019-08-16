import React, { Component } from 'react'

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
            <div>
                <h1>User does not exist! Would you like to make a new user named: {this.props.name}?</h1>
                <button onClick={this.handleClick}>Yes!</button>
            </div>
        )
    }
}
