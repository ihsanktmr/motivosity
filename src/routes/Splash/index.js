import React, { Component } from 'react'
import {
  AsyncStorage, 
  ImageBackground,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native'

import axios from 'axios'
import api from '../../utils/api'
import { handleTokenExpiration }  from '../../utils/tokenExpiration'


const USER_TOKEN = 'user_token'
const USER_REFRESH_TOKEN = 'user_refresh_token'
const SURVEY_DATA = 'survey_data'

const { width, height } = Dimensions.get('window')

export default class Root extends Component {
  constructor(props) {
      super(props)
  }
    static navigationOptions = {
      drawerLabel: () => null,
      header: null,
      accessToken: '',
      refreshToken: ''
    }

  componentDidMount(){
    // AsyncStorage.multiRemove([USER_TOKEN, USER_REFRESH_TOKEN], (err) => {})
    
    AsyncStorage.multiGet([USER_TOKEN, USER_REFRESH_TOKEN]).then((data) => {
      data[1][1] ?
      this.loggedIn()
      :
      this.props.navigation.navigate('NotLoggedIn')
    })
  }

  async loggedIn(){
    var surveyData = await handleTokenExpiration(true)
    surveyData ? AsyncStorage.multiSet([[SURVEY_DATA,JSON.stringify(surveyData)]]) : null
     this.props.navigation.navigate('LoggedIn')
}

  render() {
    // StatusBar.setBarStyle("light-content")
    // if (Platform.OS == 'android') {
    //   StatusBar.setBackgroundColor("rgba(0,0,0,0)")
    //   StatusBar.setTranslucent(true)
    // }
   return (
    <ImageBackground
      source={require('../../assets/images/mv-splash.png')}
      style={{width, height}}
      resizeMode='cover'
    />
   )
  }
}