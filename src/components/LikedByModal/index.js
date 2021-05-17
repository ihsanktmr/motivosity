import React, { Component } from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Modal
} from 'react-native'

import { avatarBaseUrl } from '../../utils/images'

export default class LikedByModal extends React.Component {
  constructor(props) {
    super(props)
  }

  render () {
    const { 
        visible,
        likedByUsers,
        onRequestClose
    } = this.props
    return(
        <Modal
            animationType="slide"
            style={{position:'relative'}}
            visible={visible}
            onRequestClose={() => onRequestClose()}
        >
            <View style={{position:'absolute',right: 10,top: 40,zIndex:1}}>
            <TouchableHighlight
                onPress={() => onRequestClose()}
                underlayColor="transparent"
            >
                <Text style={{color:'#000000',fontSize:20,padding:10,zIndex:1000}}>
                X
                </Text>
            </TouchableHighlight>
            </View>
            <View style={{paddingHorizontal: 20,paddingVertical:50}}>
            {
                likedByUsers.map((data,key) =>{
                return (
                    <View
                    style={{width:300,height: 60,flexDirection:'row'}}
                    key={key}
                    >
                    <Image
                        style={{width:30,height: 30,marginRight: 5}}
                        source={{uri: avatarBaseUrl + data.avatarUrl}}
                    />
                    <View style={{marginLeft: 5,marginBottom: 5}}><Text>{data.fullName}</Text></View>
                    </View>
                )
                })
            }
            </View>
        </Modal>
    )
  }
}

const styles = StyleSheet.create({
})