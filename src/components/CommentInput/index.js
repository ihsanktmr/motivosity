import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TextInput
} from 'react-native'

export default class CommentInput extends Component {
  constructor() {
    super()
  }

  render() {
    const {
      onSubmitEditing,
      onChangeText,
    } = this.props
    return (
        <View style={styles.commentInputWrapper}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add comment here"
              placeholderTextColor="#DADADA"
              returnKeyType='done'
              onSubmitEditing={() => onSubmitEditing()}
              onChangeText={(val) => onChangeText(val)}
              underlineColorAndroid='rgba(0,0,0,0)'
            />
            <TouchableHighlight
              style={styles.postBtn}
              onPress={() => onSubmitEditing()}
              underlayColor='transparent'
            >
              <Text style={{color: '#66C7E5'}}>Post</Text>
            </TouchableHighlight>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  commentInputWrapper: {
      flex:1,
      flexDirection:'row',
      borderColor: '#EDEDED',
      borderTopWidth: 1
  },
  commentInput: {
      borderColor: '#D3D3D3',
      borderRadius: 7,
      borderWidth: 1,
      color:'#000000',
      height:40,
      padding: 5,
      margin: 10,
      flex:1
  },
  postBtn:{
      flex: 0,
      marginRight: 20,
      alignSelf: 'center'
  }
})