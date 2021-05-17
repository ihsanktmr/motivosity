import React, { Component } from 'react'
import {
  Dimensions,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableHighlight,
  Platform,
  ImageBackground
} from 'react-native'

import axios from 'axios'
import api from '../../utils/api'

import ParallaxScrollView from 'react-native-parallax-scroll-view'
import TagInput from 'react-native-tag-input'

import Foundation from 'react-native-vector-icons/Foundation'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

import { selectedUserProfile } from '../../utils/api'
import { avatarBaseUrl } from '../../utils/images'
import { handleTokenExpiration }  from '../../utils/tokenExpiration'
import ServerError from  '../../components/ServerError'


export default class ProfileView extends Component {
  constructor(props) {
      super(props)
      this.state = {
        currentUserProfileData: null,
        fullName: '',
        title: '',
        history: '',
        email: '',
        phone: '',
        personalityType: '',
        location: '',
        department: '',
        interests: '',
        responsibilities: '',
        serverError: false
      }
  }

  componentDidMount(){
    if(this.props.navigation.screenProps.currentScreen === 'Search'){
      this.getCurrentUserProfile(this.props)
    }
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.navigation.screenProps.currentScreen === 'SearchAndProfile' && nextProps.navigation.screenProps.currentScreen !== this.props.navigation.screenProps.currentScreen)) {
      this.getCurrentUserProfile(nextProps)
    }
  }

  async getCurrentUserProfile(props){
    try {
      const response = await axios.get(api.selectedUserProfile() + props.navigation.navigation.state.params.userID + '/profile')
        this.setState({
          currentUserProfileData: response.data.response,
          fullName: response.data.response.user.fullName,
          title: response.data.response.user.title,
          email: response.data.response.user.email,
          phone: response.data.response.user.phone,
          personalityType: response.data.response.user.personalityType,
          location: response.data.response.user.location,
          department: response.data.response.user.department,
          history: response.data.response.user.history,
          interests: response.data.response.user.interests,
          responsibilities: response.data.response.user.responsibilities
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
          !tokenError ? await this.getCurrentUserProfile(this.props)
          : 
          this.setState({
            serverError: true
          }, () => this.triggerChildAlert(), setTimeout(()=>{this.props.navigation.navigate('Logout')}, 4000))
        }
      }
  }

  componentWillUnmount(){
    this.setState({
      currentUserProfileData: null,
      fullName: '',
      title: '',
      history: '',
      email: '',
      phone: '',
      personalityType: '',
      location: '',
      department: '',
      interests: '',
      responsibilities: ''
    })
  }

  triggerChildAlert(){
    this.refs.child.serverErrorAlert();
  }

  render() {
   return (
    Platform.OS === 'ios' ?  
     <ParallaxScrollView
        backgroundColor="#61C7E7"
        contentBackgroundColor="#EDEDED"
        renderBackground={() =>
          {
            return (this.state.currentUserProfileData ?
             <View key="background">
               <Image
                 source={{uri: avatarBaseUrl + this.state.currentUserProfileData.user.backgroundImageUrl,
                 width: window.width,
                 height: PARALLAX_HEADER_HEIGHT}}
                 />
               <View
                 style={{
                   position: 'absolute',
                   top: 0,
                   width: window.width,
                   backgroundColor: 'transparent',
                   height: PARALLAX_HEADER_HEIGHT}}
               />
           </View>
          : null)
           }
         }
        parallaxHeaderHeight={PARALLAX_HEADER_HEIGHT}
        renderForeground={() => (
            this.props.showBackBtn ?
            <TouchableHighlight style={styles.backButton}>
              <MaterialIcons
                name='keyboard-arrow-left'
                color='#FFFFFF' size={35}
                onPress={() => 
                  this.setState({
                    currentUserProfileData: null,
                    fullName: '',
                    title: '',
                    history: '',
                    email: '',
                    phone: '',
                    personalityType: '',
                    location: '',
                    department: '',
                    interests: '',
                    responsibilities: ''
                  }, () => this.props.navigation.navigation.goBack())}
                />
            </TouchableHighlight>
            : null
        )}
        >
        <View style={styles.mainContent}>
          <View style={styles.main}>
            <View style={styles.mainWrapper}>
              <View style={styles.userProfileImageWrapper}>
                <View style={styles.userProfileImage}>
                {
                  this.state.currentUserProfileData ?
                    <Image
                      style={styles.userImage}
                      source={{uri: avatarBaseUrl + this.state.currentUserProfileData.user.avatarUrl}}
                      resizeMode='contain'
                      >
                    </Image>
                  : null
                }
                </View>
              </View>
              <View style={styles.header}>
                <View style={styles.title}>
                  <Text style={styles.userName}>{this.state.fullName}</Text>
                  <Text style={styles.userJob}>{this.state.title}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.additionalInfo}>
            <View style={styles.additionalContainer}>
              <View style={styles.additionalWrapper}>
                <View style={styles.contact}>
                  <Text style={{marginBottom: 15,fontSize: 15}}>Contact</Text>
                  <View style={styles.mail}>
                    <Foundation name='mail' size={22} style={{marginRight: 10,color: '#61C7E7'}}/>
                    <Text style={{marginTop: 2,color: '#61C7E7'}}>{this.state.email}</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <FontAwesome name='phone' size={22} style={{marginRight: 10,color: '#61C7E7'}}/>
                    <Text style={{marginTop: 2,color: '#61C7E7'}}>{this.state.phone}</Text>
                  </View>
                </View>
                <View style={styles.otherInfo}>
                  <View style={styles.otherUpper}>
                    <View style={{flex:3}}>
                      <Text style={styles.otherTitle}>Personality</Text>
                      <Text style={styles.otherText}>{this.state.personalityType}</Text>
                    </View>
                    <View style={{flex:2}}>
                      <Text style={styles.otherTitle}>Location</Text>
                      <Text style={styles.otherText}>{this.state.location}</Text>
                    </View>
                  </View>
                  <View>
                    <Text style={styles.otherTitle}>Department</Text>
                    <Text style={styles.otherText}>{this.state.department}</Text>
                  </View>
                </View>
                <View style={styles.responsibilities}>
                  <Text style={{fontSize: 15}}>Responsibilities</Text>
                  <Text style={styles.otherText}>{this.state.responsibilities}</Text>
                </View>
                <View style={styles.interests}>
                  <Text style={{fontSize: 15}}>Interests</Text>
                  <Text style={styles.otherText}>{this.state.interests}</Text>
                </View>
                <View style={styles.history}>
                  <Text style={{fontSize: 15}}>History</Text>
                  <Text style={styles.otherText}>{this.state.history}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ParallaxScrollView>
      :
      <ScrollView style={{flex:1}}>
      {
        this.state.currentUserProfileData ?
        <View>
          <ImageBackground
            source={{uri: avatarBaseUrl + this.state.currentUserProfileData.user.backgroundImageUrl}}
            resizeMode='cover'
            style={{width: window.width,height: PARALLAX_HEADER_HEIGHT}}
          >
          <View style={styles.cover}>
            <View style={{ position: 'absolute',bottom: -200,left: 0,right:0,zIndex: 1000}}>
            <View style={styles.userProfileImage}>
            {
              this.state.currentUserProfileData ?
                <ImageBackground
                  style={styles.userImage}
                  source={{uri: avatarBaseUrl + this.state.currentUserProfileData.user.avatarUrl}}
                  resizeMode='contain'
                >
                </ImageBackground>
              : null
            }
            </View>
          </View>
        </View>
        </ImageBackground>
        <View style={styles.mainContent}>
          <View style={styles.main}>
          <View style={styles.mainWrapper}>
            <View style={styles.header}>
              <View style={styles.title}>
                <Text style={styles.userName}>{this.state.fullName}</Text>
                <Text style={styles.userJob}>{this.state.title}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.additionalInfo}>
        <View style={styles.additionalContainer}>
          <View style={styles.additionalWrapper}>
            <View style={styles.contact}>
              <Text style={{marginBottom: 15,fontSize: 15}}>Contact</Text>
              <View style={styles.mail}>
                <Foundation name='mail' size={22} style={{marginRight: 10,color: '#61C7E7'}}/>
                <Text style={{marginTop: 2,color: '#61C7E7'}}>{this.state.email}</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <FontAwesome name='phone' size={22} style={{marginRight: 10,color: '#61C7E7'}}/>
                <Text style={{marginTop: 2,color: '#61C7E7'}}>{this.state.phone}</Text>
              </View>
            </View>
            <View style={styles.otherInfo}>
              <View style={styles.otherUpper}>
                <View style={{flex:3}}>
                  <Text style={styles.otherTitle}>Personality</Text>
                  <Text style={styles.otherText}>{this.state.personalityType}</Text>
                </View>
                <View style={{flex:2}}>
                  <Text style={styles.otherTitle}>Location</Text>
                  <Text style={styles.otherText}>{this.state.location}</Text>
                </View>
              </View>
              <View>
                <Text style={styles.otherTitle}>Department</Text>
                <Text style={styles.otherText}>{this.state.department}</Text>
              </View>
            </View>
            <View style={styles.responsibilities}>
              <Text style={{fontSize: 15}}>Responsibilities</Text>
              <Text style={styles.otherText}>{this.state.responsibilities}</Text>
            </View>
            <View style={styles.interests}>
              <Text style={{fontSize: 15}}>Interests</Text>
              <Text style={styles.otherText}>{this.state.interests}</Text>
            </View>
            <View style={styles.history}>
              <Text style={{fontSize: 15}}>History</Text>
              <Text style={styles.otherText}>{this.state.history}</Text>
            </View>
          </View>
        </View>
      </View>
      </View>
      </View>
      : null
    }
    {
      this.state.serverError ? 
      <ServerError
      ref="child"
      /> : null
    }
  </ScrollView>
    )
  }
}

const window = Dimensions.get('window')
const PARALLAX_HEADER_HEIGHT = 200

const styles = StyleSheet.create({
  container:{
    flex:1,
    padding:20,
    alignItems:'stretch',
    justifyContent:'center',
  },
  mainContent:{
    marginTop: -50
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: 35,
    zIndex: 1000
  },
  main:{
    alignItems: 'center',
    flex: 1
  },
  mainWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    width: '90%',
    height: '100%',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DDDDDD'
  },
  userProfileImageWrapper: {
    position: 'absolute',
    top: -35,
    left: 0,
    right:0,
    zIndex: 1000
  },
  userProfileImage: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    padding: 5,
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  header: {
    flex: 1
  },
  title: {
    flex: 0.6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 35
  },
  userName: {
    fontSize: 35,
    color: '#61C7E7',
    marginBottom: 5
  },
  userJob: {
    color: '#6f6f6f',
    fontSize: 18,
    fontWeight: '100',
    marginBottom: 20
  },
  userImage: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
  },
  additionalInfo: {
    marginTop: 0,
    alignItems: 'center',
    flex:1,
    marginBottom: 30
  },
  additionalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    padding: 20,
    paddingBottom: 0,
    width: '90%',
    height: '100%',
    marginTop: 5
  },
  additionalWrapper: {
    flex: 1
  },
  contact: {
    marginBottom: 15
  },
  mail: {
    flexDirection: 'row',
    marginBottom: 10
  },
  otherInfo: {
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderBottomColor: '#EDEDED',
    borderTopColor: '#EDEDED',
    paddingVertical: 25
  },
  otherUpper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25
  },
  otherTitle: {
    fontSize: 15
  },
  otherText: {
    fontFamily: 'Lato-Light'
  },
  responsibilities: {
    marginVertical: 25
  },
  interests: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderBottomColor: '#EDEDED',
    borderTopColor: '#EDEDED',
    paddingVertical: 25
  },
  history: {
    marginVertical:25
  }
})