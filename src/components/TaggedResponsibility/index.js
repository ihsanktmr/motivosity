import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native'

export default class TaggedResponsibility extends React.Component {
  constructor(props) {
    super(props)
  }

  render () {
    const {
      responsibility,
      responsibilityId,
      onPress
    } = this.props
    return(
      <View style={styles.taggedUserWrapper}>
        <Text style={styles.taggedName}>
          {responsibility}
        </Text>
        <TouchableHighlight 
          underlayColor='transparent' 
          onPress={() => onPress(responsibilityId, responsibility)}
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