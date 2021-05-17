import {
  AsyncStorage
} from 'react-native'

import axios from 'axios'
import api from './api'

const USER_TOKEN = 'user_token'
const USER_REFRESH_TOKEN = 'user_refresh_token'
const CURRENCY_SYMBOL = 'company_currency_symbol'
const CURRENCY_NICKNAME = 'company_currency_nickname'

export const handleTokenExpiration = async (loggedIn) =>{
  let refreshToken = null
  await AsyncStorage.multiGet([USER_TOKEN, USER_REFRESH_TOKEN]).then((data) => {
    refreshToken = data[1][1]
    })
    
    let body = {
      refreshToken
    }
  try {
    const response = await axios.post(loggedIn ? api.userRefreshTokenUrlWithSurvey() : api.userRefreshTokenUrl(), body)
    await AsyncStorage.multiSet([
      [USER_TOKEN,response.data.response.accessToken],
      [USER_REFRESH_TOKEN,response.data.response.refreshToken],
      [CURRENCY_SYMBOL,response.data.response.currency.currencySymbol],
      [CURRENCY_NICKNAME,response.data.response.currency.currencyNickname]
    ])
    await AsyncStorage.multiGet([USER_TOKEN, USER_REFRESH_TOKEN]).then((data) => {
      axios.defaults.headers.common['Authorization'] = `Bearer ${data[0][1]}`
      axios.defaults.headers.common['Content-Type'] = 'application/json'
      axios.defaults.headers.common['Accept'] = 'application/json'
      axios.defaults.headers.common['RequestFrom'] = 'MobileApp'
    })
    return loggedIn ? response.data.response.survey : null
    } catch (error) {
      return true
    }
}