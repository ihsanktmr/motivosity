import React, { Component } from 'react'
import { StatusBar, Platform } from 'react-native'
import { Root } from './src/config/router'
import {
  setCustomText
} from 'react-native-global-props'
import axios from 'axios'

export default class App extends Component {
  constructor() {
    super()
    this.state = {
      currentTab: null,
      isReady: false,
      accessToken: '',
      refreshToken: ''
    }
    console.disableYellowBox = true
  }

  componentDidMount() {
    axios.defaults.headers.common['Content-Type'] = 'application/json'
    axios.defaults.headers.common['Accept'] = 'application/json'
    axios.defaults.headers.common['RequestFrom'] = 'MobileApp'
  }

  getCurrentRouteName(navigationState) {
    if (!navigationState) {
      return null
    }
    const route = navigationState.routes[navigationState.index]
    if (route.routes) {
      return this.getCurrentRouteName(route)
    }
    return route.routeName
  }

  defaultFonts() {
    const customTextProps = {
      style: {
        fontFamily: 'Lato-Regular'
      }
    }
    setCustomText(customTextProps)
  }

  render() {
    StatusBar.setBarStyle("dark-content")
    if (Platform.OS == 'android') {
      StatusBar.setBackgroundColor("#fff")
      StatusBar.setTranslucent(false)
    }
              {/* <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} translucent={false} />  */}


    this.defaultFonts()
    return (
      <Root
        onNavigationStateChange={(prevState, currentState) => {
          const currentScreen = this.getCurrentRouteName(currentState)
          const prevScreen = this.getCurrentRouteName(prevState)
          if (prevScreen !== currentScreen) {
            this.setState({ currentTab: currentScreen })
          }
        }}
        screenProps={{ currentScreen: this.state.currentTab }}
      />
    )
  }
}
