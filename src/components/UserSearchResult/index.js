import React, { Component } from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native'

import { avatarBaseUrl } from '../../utils/images'

export default class UserSearchResult extends React.Component {
  constructor(props) {
    super(props)
  }

  render () {
    const {
      index,
      resultsLength,
      data,
      onPress
    } = this.props
    return(
      <TouchableHighlight
        style={[styles.resultContainer, 
          { backgroundColor: 
              index === 0 ? 
              '#E2F4FA' : '#FFFFFF', 
            borderBottomWidth: 
              resultsLength === (index + 1) ? 
              1 : 0
          }]}
        underlayColor='transparent'
        onPress={() => onPress(index)}
      >
        <View style={{flexDirection: 'row',justifyContent:'space-between'}}>
          <Text style={styles.text}>
            {data.fullName}
          </Text>
          <Image
            style={styles.avatar}
            source={{uri: avatarBaseUrl + data.avatarUrl}}
          />
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
  },
  avatar: {
    width:20,
    height: 20,
    borderRadius: 3
  }
})