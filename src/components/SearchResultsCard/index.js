import React, { Component } from 'react'
import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native'

import Foundation from 'react-native-vector-icons/Foundation'
import { avatarBaseUrl } from '../../utils/images'

export default class SearchResultsCard extends Component {
  constructor(props) {
      super(props)
  }

  render() {
    const {
      profile,
      onPress
    } = this.props
    return (
        <View style={styles.container}>
          <TouchableHighlight
            onPress={() => onPress(profile.id)}
            underlayColor='transparent'
          >
          <View style={styles.topPart}>
            <View style={styles.profileImage}>
              <Image
                style={{width: '100%',height: '100%'}}
                source={{uri: avatarBaseUrl + profile.avatarUrl}}
              />
            </View>
            <View style={styles.fullName}>
              <Text style={{fontSize: 18,color: '#61c7e7'}}>{profile.fullName}</Text>
              <Text style={{fontSize: 18,fontFamily: 'Lato-Light'}}>{profile.title}</Text>
            </View>
          </View>
          </TouchableHighlight>
          <TouchableWithoutFeedback 
            style={{flex:1}} 
            onPress={Keyboard.dismiss}
          >
            <View style={styles.bottomPart}>
                <View style={{marginBottom: 10}}>
                  <View style={styles.mail}>
                    <Foundation 
                      name='mail' 
                      size={22} 
                      style={{marginRight: 10,color: '#61C7E7'}}
                    />
                    <Text style={{marginTop: 2,color: '#61C7E7',fontSize: 16}}>{profile.email}</Text>
                  </View>
                </View>
                <View style={{marginBottom: 10}}>
                  <Text style={styles.title}>Department</Text>
                  <Text style={styles.text}>{profile.department}</Text>
                </View>
                <View style={{marginBottom: 10}}>
                  <Text style={styles.title}>Interests</Text>
                  <Text style={styles.text}>{profile.interests}</Text>
                </View>
                <View style={{marginBottom: 10}}>
                  <Text style={styles.title}>Responsibilities</Text>
                  <Text style={styles.text}>{profile.responsibilities}</Text>
                </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container:{
    width: '100%',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    borderRadius: 4,
    padding: 10,
    justifyContent: 'flex-start'
  },
  topPart: {
    flex: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
    flexDirection: 'row',
    padding: 10,
    paddingBottom: 20
  },
  profileImage: {
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'transparent',
    width: 50,
    height: 50,
    marginRight: 20
  },
  fullName: {
    width: 0,
    flexGrow: 1
  },
  bottomPart: {
    flex: 1,
    padding: 10,
    paddingBottom: 20
  },
  mail: {
    flexDirection: 'row',
    marginBottom: 10
  },
  title: {
    fontSize: 16
  },
  text: {
    fontSize: 14,
    fontFamily: 'Lato-Light'
  }
})