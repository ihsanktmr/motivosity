import React, { Component } from 'react'
import {
  View,
  StyleSheet
} from 'react-native'

import SearchResultsCard from  '../../components/SearchResultsCard'

import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

import ProfileView from '../ProfileView'
import Search from '../Search'

export default class SearchAndProfile extends Component {
  constructor(props) {
      super(props)
      this.state = {
        showSearchProfile: false,
        userID: null,
        hideLowerArea: false
      }
  }

  userSelected(selectedUser){
    this.props.navigation.setParams({userID: selectedUser})
    this.setState({
      showSearchProfile: true,
      hideLowerArea: true
    })
  }

  render() {
    return (
      <View style={{flex:1}}>
      {
        this.props.navigation.state.params && this.props.navigation.state.params.redirectedFrom === 'FEED' ?
        <View style={{flex:1}}>
          <ProfileView
            navigation={this.props}
            showBackBtn
          />
        </View>
        :
        <View style={{flex:1}}>
          <Search
            navigation={this.props}
            showUserProfile={(selectedUser) => this.userSelected(selectedUser)}
            hideLowerArea={this.state.hideLowerArea}
            clearProfileView={() => this.setState({
              showSearchProfile:false,
              hideLowerArea: false
            })}
          />
          {
            this.state.showSearchProfile ?
            <ProfileView
              navigation={this.props}
              showBackBtn={false}
            />
            : null
          }
        </View>
      }
      </View>
    ) 
  }
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    padding:20,
    alignItems:'stretch',
    justifyContent:'center',
    backgroundColor: '#61c7e7'
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: 21,
    zIndex: 1000
  },
  searchInput: {
    color: '#000000',
    fontSize: 14,
    paddingVertical: 5,
    paddingRight: 25,
    paddingLeft: 5,
    backgroundColor: '#FFFFFF',
    height: 40,
    borderRadius: 3
  },
  searchIcon: {
    backgroundColor: '#FFFFFF',
    marginRight: 7,
    top: 8,
    position: 'absolute',
    right: 0
  },
  error: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 5,
    zIndex: -1
  }
})