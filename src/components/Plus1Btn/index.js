import React, { Component } from 'react'
import {
  View,
  StyleSheet
} from 'react-native'

import { Button } from 'react-native-elements'

export default class Plus1Btn extends Component {
  constructor() {
    super()
  }

  render() {
    let commentTexts=['Ditto!', 'Way to go!', 'Awesome!', 'Nice!']
    const { 
      btnTitle,
      border,
      textColor,
      backgroundColor,
      index,
      handleDefaultText
  } = this.props
    return (
      <View style={{flex:1}}>
        <Button
            title={btnTitle}
            buttonStyle={[styles.btnStyle, {borderColor: border}]}
            color={textColor}
            backgroundColor={backgroundColor}
            onPress={(btnText) => handleDefaultText(commentTexts[index])}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  iconWrapper: {
    padding: 4,
    borderRadius: 2
  },
  btnStyle: {
    borderRadius: 4,
    borderWidth: 2,
    marginHorizontal: 0
  }
})