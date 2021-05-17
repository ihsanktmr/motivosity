import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight
} from 'react-native'

import { Button } from 'react-native-elements'

export default class GiveNowBtn extends Component {
  constructor() {
    super()
  }

  render() {
    const { 
      marginBottom,
      height,
      data,
      disabled,
      onPress
  } = this.props
    return (
      <View
        style={marginBottom ? [styles.giveNowWrapper] : [styles.giveNowWrapper]}
      >
        <Button
          buttonStyle={styles.giveNow}
          onPress={() => onPress(data)}
          underlayColor='transparent'
          title={'SEND IT!'}
          disabled={disabled}
        >
        </Button>
      </View>
    )
  }
}

const styles = StyleSheet.create({
    giveNowWrapper: {
      zIndex: -1,
      width:130,
    },
    giveNow: {
      backgroundColor: '#212121',
      borderRadius: 5,
      padding:5,
    }
})