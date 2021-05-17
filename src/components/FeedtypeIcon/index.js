import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet
} from 'react-native'

import Image from 'react-native-remote-svg'

import { avatarBaseUrl } from '../../utils/images'

const feedtypes = [
  {label:'PRSN',url:require('../../assets/images/brain.png'),backgroundColor:'#A8D56A'},
  {label:'GNRL',url:require('../../assets/images/org.png'),backgroundColor:'#414141'},
  {label:'INST',url:require('../../assets/images/heart.png'),backgroundColor:'#F3A539'},
  {label:'RESP',url:require('../../assets/images/checkmark.png'),backgroundColor:'#E36A70'},
  {label:'BDAY',url:require('../../assets/images/cake.png'),backgroundColor:'#847AD2'},
  {label:'ANVY',url:require('../../assets/images/calendar.png'),backgroundColor:'#D50048'},
  {label:'ABOT',url:require('../../assets/images/books.png'),backgroundColor:'#EBDB35'},
  {label:'APPR',url:require('../../assets/images/star.png'),backgroundColor:'#57BFE3'},  
  {label:'ANNC',url:require('../../assets/images/announcement.png'),backgroundColor:'#F3A539'},
  {label:'HGLT',url:require('../../assets/images/thumbs-up.png'),backgroundColor:'#B6DA7D'}, 
  {label:'GRUP',url:require('../../assets/images/star.png'),backgroundColor:'#57BFE3'}
]

export default class FeedtypeIcon extends Component {
  constructor() {
    super()
  }

  feedIcon(currentType){
    for (var i = 0; i < feedtypes.length; i++) {
      if (feedtypes[i].label == currentType) {
        return (
          <View style={[styles.iconWrapper, {backgroundColor: feedtypes[i].backgroundColor}]}>
            <Image
              source={feedtypes[i].url}
              style={styles.feedIcon}
            />
          </View>
        )
      }
    }
  }

  render() {
    const {
      feedType
    } = this.props
    return (
      <View>
        {
          this.feedIcon(feedType)
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  iconWrapper: {
    padding: 2,
    width: 24,
    height: 24,
    borderRadius: 2, 
    alignItems:"center",
    justifyContent:'center'
  },
  feedIcon: {
    width: 15,
    height: 15
  }
})