import React, { Component } from 'react'
import {
  Dimensions,
  Platform,
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from 'react-native'

import axios from 'axios'
import api from '../../utils/api'

import { handleTokenExpiration }  from '../../utils/tokenExpiration'

import SearchResultsCard from  '../../components/SearchResultsCard'
import ServerError from  '../../components/ServerError'

import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

const { width, height } = Dimensions.get('window')

export default class Search extends Component {
  constructor(props) {
      super(props)
      this.state = {
        searchText: '',
        searchResultIDs: [],
        searchResultsData: [],
        searchResultsDataCopy: [],
        timeout: null,
        errorMessage: '',
        focusedStyle: [{flex: 1,alignItems: 'stretch',justifyContent: 'flex-end'}],
        inputFocused: false,
        changeBackBtnFunctionality: false,
        serverError: false
      }
  }
  

  handleInputWord(inputWord){
    if (inputWord) {
      this.setState({
      searchResultsData: [],
      searchResultIDs: [],
      }, () => this.props.clearProfileView(),this.searchForUsers(inputWord))
    }
    else {
      this.setState({
        searchResultsData: [],
        searchResultIDs: [],
        errorMessage: '',
        focusedStyle: [{flex: 1,alignItems: 'stretch',justifyContent: 'flex-end'}],
        inputFocused: false
      },() => this.props.clearProfileView())
    }
  }

  timeoutPromise (time) {
    return new Promise(function(resolve) {
      setTimeout(resolve, time)
    })
  }

  async searchForUsers(inputWord){
    try {
      await this.timeoutPromise(800)
      const response = await axios.get(api.fullSearch() + '?query=' + inputWord)

        if (response.data.response.length) {
          var resultsIDs= response.data.response.map((result) => {
            return result.id
          })
          this.setState({
            searchResultIDs: resultsIDs,
            searchResultsData: response.data.response,
            errorMessage: '',
            focusedStyle: [{position:'absolute',left: 0, right: 0,top:((Platform.OS === 'ios' && height === 812) ? 80 : 60),paddingHorizontal: 20}],
            inputFocused: true
          })
        }
        else{
          this.setState({
            searchResultsData: [],
            searchResultIDs: [],
            errorMessage: "Sorry, we couldn't find any results"
          })
        }
      } catch (error) {
      if(error.response.status === 401){
        const tokenError = await handleTokenExpiration()
        !tokenError ? await this.handleInputWord(this.state.searchText)
        : 
        this.setState({
          serverError: true
        }, () => this.triggerChildAlert(),setTimeout(()=>{this.props.navigation.navigation.navigate('Logout')}, 4000))
      }
      else if(error.response.status >= 500)
      {
        this.setState({
          serverError: true,
          searchResultsData: [],
          searchResultIDs: [],
        }, () => this.triggerChildAlert())
      }
      else{
        this.setState({
          errorMessage: error.response.data.mvMessages[0].message,
          searchResultsData: [],
          searchResultIDs: [],
        })
      }
      }
  }

  handleCardPress(selectedUser){
    Keyboard.dismiss()
    var searchResultsDataCopy = [...this.state.searchResultsData]
    this.setState({
      searchResultsData: [],
      searchResultsDataCopy,
      changeBackBtnFunctionality: true
    },() => this.props.showUserProfile(selectedUser))
  }

  handleBtnFuncChange(){
    this.setState({
      searchResultsData: this.state.searchResultsDataCopy,
      changeBackBtnFunctionality: false
    },() => this.props.clearProfileView())
  }

  triggerChildAlert(){
    this.refs.child.serverErrorAlert();
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
           style={this.props.hideLowerArea ? [styles.container,{flex:0}] : styles.container}
           behavior="padding"
        >
        <TouchableHighlight
          style={styles.backButton}
          underlayColor='transparent'
          >
          <MaterialIcons
            name='keyboard-arrow-left'
            color='#FFFFFF' 
            size={35}
            onPress={() => {
              this.state.changeBackBtnFunctionality ?
                this.handleBtnFuncChange() :
                (Keyboard.dismiss(),this.props.navigation.navigation.goBack())
          }}
            />
          </TouchableHighlight>
          <View style={this.state.focusedStyle}>
            <View>
              <TextInput
                style={styles.searchInput}
                onChangeText={text => this.setState({searchText:text}, ()=> this.handleInputWord(this.state.searchText))}
                placeholder="Search names, titles, or responsibilities"
                placeholderTextColor="#DADADA"
                underlineColorAndroid='rgba(0,0,0,0)'
                />
              <Ionicons name="md-search" size={25} style={styles.searchIcon}/>
            </View>
            {
                this.state.errorMessage ? <Text style={styles.error}>{this.state.errorMessage}</Text> : null
            }
          </View>
          <ScrollView
            style={this.state.inputFocused ? [{marginTop: ((Platform.OS === 'ios' && height === 812) ? 110 : 90)}]
            : [{marginTop: 0}]}
            keyboardShouldPersistTaps='handled'
            >
          {
            this.state.searchResultsData.map((profile, key) => {
              return (
                <SearchResultsCard
                  key={key}
                  profile={profile}
                  navigation={this.props.navigation.navigation}
                  onPress={(selectedUser) => this.handleCardPress(selectedUser)}
                />
              )
            })
          }
          {
            this.state.serverError ? 
            <ServerError
            ref="child"
            /> : null
          }
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  }
}


const styles = StyleSheet.create({
  container:{
    flex:1,
    padding:20,
    alignItems:'stretch',
    justifyContent:'center',
    backgroundColor: '#61c7e7',
    zIndex:1000
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: ((Platform.OS === 'ios' && height === 812) ? 47 : 25),
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