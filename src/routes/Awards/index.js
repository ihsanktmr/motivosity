import React, { Component } from 'react'
import {
  AsyncStorage,
  Alert,
  Image,
  Modal,
  FlatList,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  KeyboardAvoidingView,
  Keyboard,
  Platform
} from 'react-native'



import axios from 'axios'
import api from '../../utils/api'

import { avatarBaseUrl } from '../../utils/images'
import { handleTokenExpiration }  from '../../utils/tokenExpiration'

import { Button } from 'react-native-elements'

import AwardsCard from '../../components/AwardsCard'
import UserSearchInput from  '../../components/UserSearchInput'
import DollarInput from  '../../components/DollarInput'
import GiveNowBtn from  '../../components/GiveNowBtn'
import ServerError from  '../../components/ServerError'

import { usersList } from '../../utils/api'

const CURRENCY_SYMBOL = 'company_currency_symbol'

export default class Awards extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currencySymbol: '$',
      awardsList:[],
      firstLoaded: false,
      modalOpen: false,
      selectedAward: null,
      userSearchText: '',
      taggedUser: [],
      wdyaUserQuery: '',
      awardText: '',
      bonusAmount: 0,
      bonusInputClear: false,
      timeout: null,
      disableBtn: false,
      errorMessage: '',
      serverError: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.screenProps.currentScreen === 'Awards' && nextProps.screenProps.currentScreen !== this.props.screenProps.currentScreen)) {
      AsyncStorage.getItem(CURRENCY_SYMBOL).then(data =>
        this.setState({currencySymbol: data},() => this.getAwardsList())
      )
    }
  }

  async getAwardsList(){
    try {
      const response = await axios.get(api.myAwardsListUrl())
        this.setState({
          awardsList: response.data.response,
          firstLoaded: true
        })
      } catch (error) {
      if(error.response.status >= 500)
      {
        this.setState({
          serverError: true
        }, () => this.triggerChildAlert())
      }
      else {
        const tokenError = await handleTokenExpiration()
        !tokenError ? await this.getAwardsList()
        : 
        this.setState({
          serverError: true
        }, () => this.triggerChildAlert(), setTimeout(()=>{this.props.navigation.navigate('Logout')}, 4000))
      }
    }
  }

  handleGiveNowClick(awardToGive){
    this.setState({
      modalOpen: true,
      selectedAward: awardToGive,
      taggedUser: [],
      awardText: '',
      bonusAmount: awardToGive.awardDollars,
      errorMessage: ''
    })
  }

  timeoutPromise (time) {
    return new Promise(function(resolve) {
      setTimeout(resolve, time)
    })
  }

  async handleInputWord(inputWord){
    if (inputWord) {
      try {
        await this.timeoutPromise(800)
        const response = await axios.get(api.usersList() + '?name=' + inputWord)
        this.filterSearch(response.data.response, inputWord)
        } catch (error) {
          if(error.response.status === 401){
            const tokenError = await handleTokenExpiration()
            !tokenError ? await this.handleInputWord(this.state.userSearchText)
            : 
            this.setState({
              serverError: true
            }, () => this.triggerChildAlert(), setTimeout(()=>{this.props.navigation.navigate('Logout')}, 4000))
          }
          else if(error.response.status >= 500)
          {
            this.setState({
              serverError: true
            }, () => this.triggerChildAlert())
          }
          else{
            this.setState({
              errorMessage: error.response.data.mvMessages[0].message
            })
          }
      }
    }
    else {
      this.setState({
        searchUserResults: [],
        wdyaUserQuery: '',
        errorMessage: '',
        errorUserSearchMessage: ''
      })
    }
  }

  filterSearch(searchResults, inputWord){
    var taggedUsers = [...this.state.taggedUser]
    if (!searchResults.length) {
      this.setState({
        errorUserSearchMessage: 'Sorry, we could not find this person'
      })
    }
    //compare the difference between already tagged users and search results from fetch(from handleInputWord)
    var uniqueResults = searchResults.filter(function(obj) {
        return !taggedUsers.some(function(obj2) {
            return obj.fullName == obj2.fullName;
        })
    })
    this.setState({
      searchUserResults: [...uniqueResults],
      wdyaUserQuery: inputWord
    })
  }

  handleXClick(index){
    var taggedUserCopy = [...this.state.taggedUser]
    var removedTaggedUsersArray = taggedUserCopy.filter((user) => user !== taggedUserCopy[index])
    this.setState({
      taggedUser: removedTaggedUsersArray
    })
  }

  handleKeyboardReturnClick(){
    this.setState({
      taggedUser: [...this.state.taggedUser, this.state.searchUserResults[0]],
      searchUserResults: [],
      wdyaUserQuery: ''
    })
  }

  handleUserSearchClick(index){
    this.setState({
      taggedUser: [...this.state.taggedUser, this.state.searchUserResults[index]],
      searchUserResults: [],
      wdyaUserQuery: ''
    })
  }

  storeAwardText(val){
    this.setState({
      awardText: val
    })
  }

  storeBonusAmount(num){
    this.setState({
      bonusAmount: num
    })
  }

  async giveAward(){
    var taggedUserCopy = [...this.state.taggedUser]
    var userIDs = taggedUserCopy.map(val => val.id)
    let body = {
      toUserIDs:userIDs,
      note:this.state.awardText,
      amount: this.state.bonusAmount
    }

    try {
      const response = await axios.put(api.giveAward() + '/' + this.state.selectedAward.id + '/giveaward', body)
        this.noteInput.clear()   //clears Thanks(note) text input
        var taggedUsersCopy = this.state.taggedUser.map( name => name.fullName)
        taggedUsersCopy.length === 1 ?
        Alert.alert(
          'Thanks!',
          `${taggedUsersCopy.toString()} has just been notified.`,
          [
            {text: 'OK', onPress: () => {
              this.setState({
                modalOpen: false,
                taggedUser: [],
                wdyaUserQuery: '',
                awardText: '',
                bonusAmount: 0,
                bonusInputClear: true,
                disableBtn: false,
                errorMessage: ''
              }, () => this.getAwardsList())
            }},
          ],
          { cancelable: false }
        )
        : Alert.alert(
          'Thanks!',
          `${taggedUsersCopy.toString()} have just been notified.`,
          [
            {text: 'OK', onPress: () => {
              this.setState({
                modalOpen: false,
                taggedUser: [],
                wdyaUserQuery: '',
                awardText: '',
                bonusAmount: 0,
                bonusInputClear: true,
                disableBtn: false,
                errorMessage: ''
              }, () => this.getAwardsList())
            }},
          ],
          { cancelable: false }
        )
      } catch (error) {
        if(error.response.status === 401){
          const tokenError = await handleTokenExpiration()
          !tokenError ? await this.giveAward()
          : 
          this.setState({
            serverError: true
          }, () => this.triggerChildAlert(), setTimeout(()=>{this.props.navigation.navigate('Logout')}, 4000))
        }
        else if(error.response.status >= 500)
        {
          this.setState({
            serverError: true,
            disableBtn: false
          }, () => this.triggerChildAlert())
        }
        else{
            this.setState({
                errorMessage: error.response.data.mvMessages[0].message,
                disableBtn: false,
            })
        }
      }
  }

  handleModalCloseClick(){
    this.setState({
      modalOpen: false,
      taggedUser: [],
      wdyaUserQuery: '',
      awardText: '',
      bonusAmount: 0,
      errorMessage: '',
      errorUserSearchMessage: ''
    }, () => this.getAwardsList())
  }


  triggerChildAlert(){
    this.refs.child.serverErrorAlert();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Awards I Give</Text>
          </View>
        <View style={styles.awardsContainer}>
          {
            this.state.awardsList.length !== 0 ? 
            <ScrollView keyboardShouldPersistTaps='always'>
            {
              this.state.firstLoaded ?
                <FlatList
                  data={this.state.awardsList}
                  keyExtractor={(item,key) => key.toString()}
                  renderItem={({item,index}) =>
                  <AwardsCard
                    currencySymbol={this.state.currencySymbol}
                    data={item}
                    key={index}
                    onPress={(selectedAward) => this.handleGiveNowClick(selectedAward)}
                  />
                }
                />
                : null
              }
          </ScrollView> 
          :
          <Text style={styles.noAwardsText}>No Awards to show at this moment!</Text>
          }
         
          <Modal
            animationType="slide"
            style={{position:'relative'}}
            visible={this.state.modalOpen}
            onRequestClose={() => this.handleModalCloseClick()}
          >
            <View style={styles.modalWrapper}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                style={{ flex: 1 }}
              >
              <ScrollView keyboardShouldPersistTaps='handled'>
              {
                this.state.selectedAward ?
                <View style={styles.awardHeader}>
                  <Image
                    style={styles.awardsImage}
                    source={{uri: avatarBaseUrl + this.state.selectedAward.awardIconURL}}
                  />
                  <Text style={styles.modalTitle}>{this.state.selectedAward.awardName}</Text>
                </View> : null
              }
                <UserSearchInput
                  taggedUser={this.state.taggedUser}
                  wdyaUserQuery={this.state.wdyaUserQuery}
                  searchUserResults={this.state.searchUserResults}
                  errorMessage={this.state.errorUserSearchMessage}
                  handleXClick={(index) => this.handleXClick(index)}
                  handleInputWord={(text) => this.setState({userSearchText: text}, () => this.handleInputWord(this.state.userSearchText))}
                  handleKeyboardReturnClick={() => this.handleKeyboardReturnClick()}
                  handleUserSearchClick={(index)=> this.handleUserSearchClick(index)}
                />
                <Text style={styles.commentTitle}>Say Something...</Text>
                <View style={styles.thanksWrapper}>
                  <TextInput
                    style={styles.thanksInput}
                    multiline
                    ref={input => { this.noteInput = input }}
                    placeholder="Add your comment here"
                    placeholderTextColor="#DADADA"
                    onChangeText={text => this.storeAwardText(text)}
                    underlineColorAndroid='rgba(0,0,0,0)'
                  />
                </View>
                {
                  (this.state.selectedAward && this.state.selectedAward.awardDollars !== 0)?
                    <View>
                      <Text style={styles.amountTitle}>Award amount</Text>
                      <DollarInput
                        currencySymbol={this.state.currencySymbol}
                        bonusAmount={this.state.selectedAward.awardDollars}
                        storeBonusAmount={(number) => this.storeBonusAmount(number)}
                        bonusInputClear={this.state.bonusInputClear}
                        clearInput={() => this.setState({bonusInputClear: false})}
                      />
                    </View> : null
                }
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex:1}}>
                    <Button
                      buttonStyle={styles.cancelBtn}
                      textStyle={{textAlign: 'center'}}
                      title={'Cancel'}
                      disabled={this.state.buttonDisabled}
                      onPress={() => this.handleModalCloseClick()}
                    />
                  </View>
                  <View style={{flex:1}}>
                    <GiveNowBtn
                      data={this.props.data}
                      onPress={(selectedAward) => {this.setState({disableBtn: true},() => this.giveAward(selectedAward))}}
                      disabled={this.state.disableBtn}
                    />
                    </View>
                </View>
                  <Text style={styles.error}>
                    {
                      this.state.errorMessage ? this.state.errorMessage : null
                    }
                  </Text>
                </ScrollView>
              </KeyboardAvoidingView>
          </View>
        </Modal>
      </View>
      {
        this.state.serverError ? 
        <ServerError
        ref="child"
        /> : null
      }
    </View>
    )
  }
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    marginTop:40
  },
  awardsContainer:{
    alignItems:'stretch',
    backgroundColor: '#EDEDED',
    flex:1,
    padding:20,
    paddingBottom: 0
  },
  titleWrapper:{
    backgroundColor: '#61c7e7',
    padding: 15
  },
  title:{
    alignSelf: 'center',
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'Lato-Bold'
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    color: '#AAAAAA',
    fontSize: 14,
    height: 45,
    flex: 1
  },
  commentTitle:{
    color:'#323232',
    marginTop: 20,
    zIndex:-1,
    fontSize: 18
  },
  thanksWrapper: {
    marginTop: 10,
    zIndex: -1
  },
  thanksInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDDDDD',
    borderRadius: 5,
    borderWidth: 2,
    color: '#000000',
    fontSize: 14,
    height: 90,
    paddingHorizontal: 10,
    paddingTop: 10,
    textAlignVertical: 'top'
  },
  amountTitle: {
    color:'#323232',
    marginTop: 20,
    zIndex:-1,
    fontSize: 18
  },
  cancelBtn: {
    backgroundColor: '#929292',
    borderRadius: 3,
    justifyContent: 'center',
    marginRight: 0,
    marginLeft: -15,
    marginTop: 15
  },
  modalWrapper: {
    flex: 1,
    paddingHorizontal: 25,
    paddingVertical: 40,
  },
  awardHeader: {
    alignItems: 'center',
    height: 200,
    justifyContent: 'center'
  },
  awardsImage: {
    height: 90,
    width:90,
    marginTop: 20
  },
  modalTitle: {
    fontSize: 25,
    marginTop: 15,
    textAlign: 'center'
  },
  error: {
    color: '#D50048',
    fontSize: 14,
    marginTop: 5
  },
  noAwardsText: {
    fontSize: 18,
    color: '#323232',
    marginBottom: 10
  }
})