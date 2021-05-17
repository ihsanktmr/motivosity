import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native'

export default class TaggedInterest extends React.Component {
  constructor(props) {
    super(props)
  }

  render () {
    const {
      interest,
      interestId,
      onPress
    } = this.props
    return(
      <View style={styles.taggedUserWrapper}>
        <Text style={styles.taggedName}>{interest}</Text>
        <TouchableHighlight 
          underlayColor='transparent' 
          onPress={() => onPress(interestId, interest)}
        >
        <Text style={styles.removeTag}>X</Text>
        </TouchableHighlight>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  taggedUserWrapper: {
    alignSelf: 'flex-start',
    flex: 0,
    backgroundColor:'#EDEDED',
    borderRadius: 3,
    flexDirection:'row',
    marginRight:5,
    padding: 5,
    marginBottom: 5
  },
  taggedName: {
    color:'#AAAAAA',
    marginRight: 5
  },
  removeTag: {
    color:'#AAAAAA',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3
  }
})