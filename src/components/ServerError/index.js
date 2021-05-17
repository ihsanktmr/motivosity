import React, { Component } from 'react'
import {
    Alert,
    StyleSheet,
    View,
    TouchableOpacity,
    Text
} from 'react-native'

import AwesomeAlert from 'react-native-awesome-alerts';

export default class ServerError extends Component {
    serverErrorAlert() {
        Alert.alert(
          'Oops!',
          'There was an error with that request. Try again later or contact support. Thanks!',
          [
            {text: 'Close', onPress: () => console.warn('NO Pressed'), style: 'cancel'},
          ]
        );
      }
    render() {
        return (
            null
        )
      }
    }

const styles = StyleSheet.create({
    container: {
     flex: 1,
     alignItems: 'center',
     justifyContent: 'center',
     backgroundColor: '#fff',
    }
  })