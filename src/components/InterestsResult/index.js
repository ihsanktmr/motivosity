import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native'

import { avatarBaseUrl } from '../../utils/images'

export default class InterestsResult extends React.Component {
  constructor(props) {
    super(props)
  }

  render () {
    const { 
      index,
      resultsLength,
      interest,
      interestId,
      onPress
  } = this.props
    return(
      <TouchableHighlight
        style={[styles.resultContainer, 
          { backgroundColor: index === 0 ? '#E2F4FA' 
          : '#FFFFFF', 
          borderBottomWidth: resultsLength === (index + 1) ? 1
          : 0}]}
        underlayColor='#FFFFFF'
        onPress={(selectedInterestId,selectedInterest) => onPress(interestId,interest)}>
        <View style={{flexDirection: 'row',justifyContent:'space-between'}}>
          <Text style={styles.text}>
            {interest}
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