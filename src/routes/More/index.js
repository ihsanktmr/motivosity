import React, { Component } from 'react'
import {
} from 'react-native'

export default class More extends Component {
  constructor(props) {
      super(props)
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.screenProps.currentScreen === 'More' && nextProps.screenProps.currentScreen !== this.props.screenProps.currentScreen)) {
    }
  }

  render() {
   return (
      null
    )
  }
}