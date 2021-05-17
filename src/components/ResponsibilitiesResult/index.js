import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native'

import { avatarBaseUrl } from '../../utils/images'

export default class ResponsibilitiesResult extends React.Component {
  constructor(props) {
    super(props)
  }

  render () {
    const {
      index,
      onPress,
      responsibility,
      responsibilityId,
      resultsLength
    } = this.props
    return(
      <TouchableHighlight
        style={[styles.resultContainer, { backgroundColor: index === 0 ? '#E2F4FA' : '#FFFFFF', borderBottomWidth: resultsLength === (index + 1) ? 1 : 0}]}
        underlayColor='#FFFFFF'
        onPress={(selectedResponsibilityId,selectedResponsibility) =>onPress(responsibilityId,responsibility)}>
        <View style={{flexDirection: 'row',justifyContent:'space-between'}}>
          <Text style={styles.text}>
            {responsibility}
          </Text>
        </View>
      </TouchableHighlight>
    )
  }
}

const styles = StyleSheet.create({
  resultContainer: {
    borderColor: '#66C7E5',
    borderWidth: 1,
    padding: 5
  },
  text: {
    color: '#66C7E5',
    fontSize: 15
  }
})