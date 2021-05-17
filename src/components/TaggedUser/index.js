import React, { Component } from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native'

import { avatarBaseUrl } from '../../utils/images'

export default class TaggedUser extends React.Component {
  constructor(props) {
    super(props)
  }

  render () {
    const {
      user,
      index,
      onPress
    } = this.props
    return(
      <View style={user.length > 2 ? 
        [styles.taggedUserWrapper,{alignSelf: 'flex-start'}] : 
        styles.taggedUserWrapper}>
        <Image 
          style={styles.taggedImage} 
          source={{uri: avatarBaseUrl + user[index].avatarUrl}}
        />
        <Text style={styles.taggedName}>
          {user[index].fullName}
        </Text>
        <TouchableHighlight 
          underlayColor='transparent' 
          onPress={() => onPress(index)}
        >
          <Text style={styles.removeTag}>X</Text>
        </TouchableHighlight>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  taggedUserWrapper: {
    flex: 0,
    backgroundColor:'#EDEDED',
    borderRadius: 3,
    flexDirection:'row',
    marginRight:5,
    padding: 5,
    marginBottom: 5
  },
  taggedImage: {
    borderRadius: 3,
    height: 20,
    marginRight: 5,
    width:20,
    height: 20
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