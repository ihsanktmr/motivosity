import React, { Component } from 'react'
import {
  Alert,
  ActivityIndicator,
  Dimensions,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  TextInput,
  TouchableHighlight,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  AsyncStorage,
  PermissionsAndroid
} from 'react-native'

const USER_TOKEN = 'user_token'
const USER_REFRESH_TOKEN = 'user_refresh_token'

import axios from 'axios'
import api from '../../utils/api'

// import { ImagePicker } from 'expo'
import ImagePicker from 'react-native-image-picker'

import ParallaxScrollView from 'react-native-parallax-scroll-view'
import TagInput from 'react-native-tag-input'

import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

import { Button } from 'react-native-elements'

import { avatarBaseUrl } from '../../utils/images'
import { handleTokenExpiration } from '../../utils/tokenExpiration'

import InterestsInput from '../../components/InterestsInput'
import ResponsibilitiesInput from '../../components/ResponsibilitiesInput'
import ServerError from '../../components/ServerError'
import defaultDP from '../../assets/images/profile-default.png'


export default class Profile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentUserProfileData: null,
      firstName: '',
      lastName: '',
      title: '',
      history: '',
      showHistoryBtn: false,
      currentUserInterests: [],
      clearInterestsInput: false,
      currentInterestsInputWord: '',
      interestsSuggestions: [],
      interestsTimeout: null,
      currentUserResponsibilities: [],
      clearResponsibilitiesInput: false,
      currentResponsibilitiesInputWord: '',
      responsibilitiesSuggestions: [],
      responsibilitiesTimeout: null,
      uploadingBackgroundImg: false,
      uploadingProfileImg: false,
      firstNameErrorMessage: '',
      lastNameErrorMessage: '',
      interestsErrorMessage: '',
      responsibilitiesErrorMessage: '',
      errorMessage: '',
      serverError: false
    }
  }



  componentWillReceiveProps(nextProps) {
    if ((nextProps.screenProps.currentScreen === 'Profile' && nextProps.screenProps.currentScreen !== this.props.screenProps.currentScreen)) {
      this.getCurrentUserProfile()
    }
  }

  async componentDidMount() {
    // try {
    //   const response = await axios.get(api.currentUserUrl());
    //   if (!response) {
    //     alert('Oopes.! something went Wrong');
    //     this.props.navigation.navigate('LoginScreen')
    //   }
    // } catch (error) {
    //   alert('Oopes.! something went Wrong');
    //   this.props.navigation.navigate('LoginScreen')
    // }
  }

  async getCurrentUserProfile() {
    try {
      const response = await axios.get(api.currentUserProfile())
      this.setState({
        currentUserProfileData: response.data.response,
        firstName: response.data.response.user.firstName,
        lastName: response.data.response.user.lastName,
        title: response.data.response.user.title,
        history: response.data.response.user.history,
        uploadingBackgroundImg: false,
        uploadingProfileImg: false
      }, () => {
        this.getCurrentUserInterests(response.data.response.user.id)
        this.getCurrentUserResponsibilities(response.data.response.user.id)
      })
    } catch (error) {
      if (error.response.status >= 500) {
        this.setState({
          serverError: true
        }, () => this.triggerChildAlert())
      }
      else {
        const tokenError = await handleTokenExpiration()
        !tokenError ? await this.getCurrentUserProfile()
          :
          this.setState({
            serverError: true
          }, () => this.triggerChildAlert(), setTimeout(() => { this.props.navigation.navigate('Logout') }, 4000))
      }
    }
  }

  async getCurrentUserInterests(currentUserId) {

    try {
      const response = await axios.get(api.currentUserInterests() + currentUserId)
      var currentUserInterests = response.data.response

      this.setState({
        currentUserInterests
      })
    } catch (error) {
      if (error.response.status >= 500) {
        this.setState({
          serverError: true
        }, () => this.triggerChildAlert())
      }
      else {
        const tokenError = await handleTokenExpiration()
        !tokenError ? await this.getCurrentUserInterests()
          :
          this.setState({
            serverError: true
          }, () => this.triggerChildAlert(), setTimeout(() => { this.props.navigation.navigate('Logout') }, 4000))
      }
    }
  }

  async getCurrentUserResponsibilities(currentUserId) {

    try {
      const response = await axios.get(api.currentUserResponsibilities() + currentUserId)
      var currentUserResponsibilities = response.data.response

      this.setState({
        currentUserResponsibilities
      })
    } catch (error) {
      if (error.response.status >= 500) {
        this.setState({
          serverError: true
        }, () => this.triggerChildAlert())
      }
      else {
        const tokenError = await handleTokenExpiration()
        !tokenError ? await this.getCurrentUserResponsibilities()
          :
          this.setState({
            serverError: true
          }, () => this.triggerChildAlert(), setTimeout(() => { this.props.navigation.navigate('Logout') }, 4000))
      }
    }
  }

  onChangeText = (text) => {
    this.setState({ text })
    const lastTyped = text.charAt(text.length - 1)
    const parseWhen = [',', ' ', ';', '\n']

    if (parseWhen.indexOf(lastTyped) > -1) {
      this.setState({
        interestsArray: [...this.state.interestsArray, this.state.history],
        text: ""
      })
    }
  }

  timeoutPromise(time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time)
    })
  }

  async handleInterestInputWord(text) {
    if (text) {
      try {
        await this.timeoutPromise(800)
        const response = await axios.get(api.companyInterestsUrl() + '?name=' + text)

        this.setState({
          clearInterestsInput: false
        }, () => this.filterSuggestedInterests(response.data.response, text))
      } catch (error) {
        if (error.response.status >= 500) {
          this.setState({
            serverError: true
          }, () => this.triggerChildAlert())
        }
        else {
          const tokenError = await handleTokenExpiration()
          !tokenError ? await this.handleInterestInputWord(this.state.currentInterestsInputWord)
            :
            this.setState({
              serverError: true
            }, () => this.triggerChildAlert(), setTimeout(() => { this.props.navigation.navigate('Logout') }, 4000))
        }
      }
    }
    else {
      this.setState({
        currentInterestsInputWord: '',
        interestsSuggestions: [],
        interestsErrorMessage: ''
      })
    }
  }

  async handleResponsibilityInputWord(text) {
    if (text) {
      try {
        await this.timeoutPromise(800)
        const response = await axios.get(api.companyResponsibilitiesUrl() + '?name=' + text)

        this.setState({
          clearResponsibilitiesInput: false
        }, () => this.filterSuggestedResponsibilities(response.data.response, text))
      } catch (error) {
        if (error.response.status >= 500) {
          this.setState({
            serverError: true
          }, () => this.triggerChildAlert())
        }
        else {
          const tokenError = await handleTokenExpiration()
          !tokenError ? await this.handleResponsibilityInputWord(this.state.currentResponsibilitiesInputWord)
            :
            this.setState({
              serverError: true
            }, () => this.triggerChildAlert(), setTimeout(() => { this.props.navigation.navigate('Logout') }, 4000))
        }
      }
    }
    else {
      this.setState({
        currentResponsibilitiesInputWord: '',
        responsibilitiesSuggestions: [],
        responsibilitiesErrorMessage: ''
      })
    }
  }

  filterSuggestedInterests(searchResults, inputWord) {
    var currentUserInterests = [...this.state.currentUserInterests]
    if (searchResults.length) {
      var suggestedInterests = searchResults.filter(function (obj) {
        return !currentUserInterests.some(function (obj2) {
          return obj.id == obj2.id;
        })
      })
      this.setState({
        interestsSuggestions: suggestedInterests,
        interestsErrorMessage: ''
      })
    }
    else {
      this.setState({
        interestsSuggestions: [],
        interestsErrorMessage: '',
        clearInterestsInput: false
      })
    }
  }

  filterSuggestedResponsibilities(searchResults, inputWord) {
    var currentUserResponsibilities = [...this.state.currentUserResponsibilities]
    if (searchResults.length) {
      var suggestedResponsibilities = searchResults.filter(function (obj) {
        return !currentUserResponsibilities.some(function (obj2) {
          return obj.id == obj2.id;
        })
      })
      this.setState({
        responsibilitiesSuggestions: suggestedResponsibilities,
        responsibilitiesErrorMessage: ''
      })
    }
    else {
      this.setState({
        responsibilitiesSuggestions: [],
        responsibilitiesErrorMessage: '',
        clearResponsibilitiesInput: false
      })

    }
  }

  async handleInterestClick(selectedInterestId, selectedInterest) {
    let body = {
      interestName: this.state.currentInterestsInputWord
    }
    try {
      const response = await axios.post(api.currentUserInterests() + selectedInterestId, body)
      var currentUserInterestsCopy = [... this.state.currentUserInterests]

      currentUserInterestsCopy.push(
        {
          id: selectedInterestId,
          interestName: selectedInterest
        }
      )
      this.setState({
        currentUserInterests: currentUserInterestsCopy,
        clearInterestsInput: true,
        currentInterestsInputWord: '',
        interestsSuggestions: []
      })
    } catch (error) {
      if (error.response.status >= 500) {
        this.setState({
          serverError: true
        }, () => this.triggerChildAlert())
      }
      else {
        const tokenError = await handleTokenExpiration()
        !tokenError ? await this.handleInterestClick(selectedInterestId, selectedInterest)
          :
          this.setState({
            serverError: true
          }, () => this.triggerChildAlert(), setTimeout(() => { this.props.navigation.navigate('Logout') }, 4000))
      }
    }
  }

  async handleResponsibilityClick(selectedResponsibilityId, selectedResponsibility) {
    let body = {
      responsibilityName: this.state.currentResponsibilitiesInputWord
    }

    try {
      const response = await axios.post(api.currentUserResponsibilities() + selectedResponsibilityId, body)

      var currentUserResponsibilitiesCopy = [... this.state.currentUserResponsibilities]
      currentUserResponsibilitiesCopy.push(
        {
          id: selectedResponsibilityId,
          responsibilityName: selectedResponsibility
        }
      )
      this.setState({
        currentUserResponsibilities: currentUserResponsibilitiesCopy,
        clearResponsibilitiesInput: true,
        currentResponsibilitiesInputWord: '',
        responsibilitiesSuggestions: []
      })
    } catch (error) {
      if (error.response.status >= 500) {
        this.setState({
          serverError: true
        }, () => this.triggerChildAlert())
      }
      else {
        const tokenError = await handleTokenExpiration()
        !tokenError ? await this.handleResponsibilityClick(selectedResponsibilityId, selectedResponsibility)
          :
          this.setState({
            serverError: true
          }, () => this.triggerChildAlert(), setTimeout(() => { this.props.navigation.navigate('Logout') }, 4000))
      }
    }
  }

  async handleInterestXClick(id, interest) {

    try {
      const response = await axios.delete(api.currentUserInterests() + id)

      var currentUserInterestsCopy = [... this.state.currentUserInterests]
      var newInterestsArray = currentUserInterestsCopy.filter(interest => interest.id !== id);
      this.setState({
        currentUserInterests: newInterestsArray,
        interestsSuggestions: [],
        interestsErrorMessage: ''
      })
    } catch (error) {
      if (error.response.status === 401) {
        const tokenError = await handleTokenExpiration()
        !tokenError ? await this.handleInterestXClick()
          :
          this.setState({
            serverError: true
          }, () => this.triggerChildAlert(), setTimeout(() => { this.props.navigation.navigate('Logout') }, 4000))
      }
      else if (error.response.status >= 500) {
        this.setState({
          serverError: true
        }, () => this.triggerChildAlert())
      }
      else {
        this.setState({
          errorMessage: response.data.mvMessages[0].message,
        })
      }
    }
  }

  async handleResponsibilityXClick(id, responsibility) {

    try {
      const response = await axios.delete(api.currentUserResponsibilities() + id)

      var currentUserResponsibilitiesCopy = [... this.state.currentUserResponsibilities]
      var newResponsibilitiesArray = currentUserResponsibilitiesCopy.filter(responsibility => responsibility.id !== id);
      this.setState({
        currentUserResponsibilities: newResponsibilitiesArray,
        responsibilitiesSuggestions: [],
        responsibilitiesErrorMessage: ''
      })
    } catch (error) {
      if (error.response.status === 401) {
        const tokenError = await handleTokenExpiration()
        !tokenError ? await this.handleResponsibilityXClick(id, responsibility)
          :
          this.setState({
            serverError: true
          }, () => this.triggerChildAlert(), setTimeout(() => { this.props.navigation.navigate('Logout') }, 4000))
      }
      else if (error.response.status >= 500) {
        this.setState({
          serverError: true
        }, () => this.triggerChildAlert())
      }
      else {
        this.setState({
          errorMessage: error.response.data.mvMessages[0].message,
        })
      }
    }
  }

  async handleKeyboardReturnClickInterest() {
    let body = {
      interestName: this.state.currentInterestsInputWord
    }

    try {
      const response = await axios.put(api.companyInterestsUrl(), body)

      if (this.state.interestsSuggestions.length) {
        this.handleInterestClick(this.state.interestsSuggestions[0].id, this.state.interestsSuggestions[0].interestName)
      }
      else {
        var returnedInterests = [...response.data.response]
        this.setState({
          currentUserInterests: returnedInterests,
          clearInterestsInput: true
        })
      }
    } catch (error) {
      if (error.response.status === 401) {
        const tokenError = await handleTokenExpiration()
        !tokenError ? await this.handleKeyboardReturnClickInterest()
          :
          this.setState({
            serverError: true
          }, () => this.triggerChildAlert(), setTimeout(() => { this.props.navigation.navigate('Logout') }, 4000))
      }
      else if (error.response.status >= 500) {
        this.setState({
          serverError: true
        }, () => this.triggerChildAlert())
      }
      else {
        this.setState({
          interestsErrorMessage: error.response.data.mvMessages[0].message
        })
      }
    }
  }

  async handleKeyboardReturnClickResponsibility() {
    let body = {
      responsibilityName: this.state.currentResponsibilitiesInputWord
    }

    try {
      const response = await axios.put(api.companyResponsibilitiesUrl(), body)

      if (this.state.responsibilitiesSuggestions.length) {
        this.handleResponsibilityClick(this.state.responsibilitiesSuggestions[0].id, this.state.responsibilitiesSuggestions[0].responsibilityName)
      }
      else {
        var returnedResponsibilities = [...response.data.response]
        this.setState({
          currentUserResponsibilities: returnedResponsibilities,
          clearResponsibilitiesInput: true
        })
      }
    } catch (error) {
      if (error.response.status === 401) {
        const tokenError = await handleTokenExpiration()
        !tokenError ? await this.handleKeyboardReturnClickResponsibility()
          :
          this.setState({
            serverError: true
          }, () => this.triggerChildAlert(), setTimeout(() => { this.props.navigation.navigate('Logout') }, 4000))
      }
      else if (error.response.status >= 500) {
        this.setState({
          serverError: true
        }, () => this.triggerChildAlert())
      }
      else {
        this.setState({
          responsibilitiesErrorMessage: error.response.data.mvMessages[0].message
        })
      }
    }
  }

  async saveUserProfile() {
    Keyboard.dismiss()

    let body = {
      "user":
      {
        "firstName": this.state.firstName,
        "lastName": this.state.lastName,
        "history": this.state.history,
        "title": this.state.title
      },
      "responsibilityList": this.state.responsibilitiesObject
    }

    try {
      const response = await axios.post(api.currentUserProfile(), body)

      this.setState({
        currentUserProfileData: response.data.response,
        firstName: response.data.response.user.firstName,
        lastName: response.data.response.user.lastName,
        title: response.data.response.user.title,
        history: response.data.response.user.history
      })
    } catch (error) {
      if (error.response.status === 401) {
        const tokenError = await handleTokenExpiration()
        !tokenError ? await this.saveUserProfile()
          :
          this.setState({
            serverError: true
          }, () => this.triggerChildAlert(), setTimeout(() => { this.props.navigation.navigate('Logout') }, 4000))
      }
      else if (error.response.status >= 500) {
        this.setState({
          serverError: true
        }, () => this.triggerChildAlert())
      }
      else {
        switch (error.response.data.mvMessages[0].key) {
          case 'firstName':
            this.setState({
              firstNameErrorMessage: error.response.data.mvMessages[0].message
            })
            break;
          case 'lastName':
            this.setState({
              lastNameErrorMessage: error.response.data.mvMessages[0].message
            })
            break;
          default:
            this.setState({
              errorMessage: error.response.data.mvMessages[0].message,
            })
        }
        if (error.response.data.mvMessages[0].key === 'firstName') {
        }
        else {
          this.setState({
            lastNameErrorMessage: error.response.data.mvMessages[0].message
          })
        }
      }
    }
  }
  pickBackgroundImg = async () => {
    ImagePicker.showImagePicker({ quality: 0.5 }, (response) => {
      if (response.didCancel) {
        this.setState({ uploadingBackgroundImg: false })
      } else if (response.error) {
        alert('Upload failed, sorry :(')
        this.setState({ uploadingBackgroundImg: false })
      } else {
        const source = { uri: response.uri };
        this.setState({ uploadingProfileImg: true }, () => {
          this.handleImagePicked(source);
        })
      }
    });
  }

  handleImagePicked = async pickerResult => {
    let uploadResponse
    try {
      if (!pickerResult.cancelled) {
        uploadResponse = await this.uploadImageAsync(pickerResult.uri)
      }
    } catch (e) {
      alert('Upload failed, sorry :(')
      this.setState({ uploadingBackgroundImg: false })
    } finally {
    }
  }

  async uploadImageAsync(uri) {
    let fileType = uri.substr(uri.length - 3)
    let formData = new FormData()
    formData.append('file', {
      uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`
    })

    let body = {
      body: formData
    }
    AsyncStorage.multiGet([USER_TOKEN, USER_REFRESH_TOKEN]).then((data) => {
      fetch(api.uploadBackgroundImageUrl(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data[0][1]}`,
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      })
        .then((response) => response.json())
        .then((responseData) => {
          if (responseData.success) {
            this.getCurrentUserProfile()
            this.setState({ uploadingBackgroundImg: false })
          }
          else {
            handleTokenExpiration(this.props.navigation, () => {
              this.pickProfileImg()
              this.setState({ uploadingBackgroundImg: false })
            })
          }
        })
        .catch(error => {
        })

    })
  }

  pickProfileImg = 
    async () => {
      ImagePicker.showImagePicker({ quality: 0.4 }, (response) => {
        if (response.didCancel) {
          this.setState({ uploadingProfileImg: false })
        } else if (response.error) {
          alert('Upload failed, sorry :(')
          this.setState({ uploadingProfileImg: false })
        } else {
          const source = { uri: response.uri };
          this.setState({ uploadingProfileImg: true }, () => {
            this.handlePickedImage(source);
          })
        }
      });
    }

  handlePickedImage = async pickerRes => {
    try {
      if (pickerRes) {
        uploadResp = await this.uploadProfileImgAsync(pickerRes.uri)
      }
    } catch (e) {
      alert('Upload failed, sorry :(')
      this.setState({ uploadingProfileImg: false })
    } finally {
    }
  }

  async uploadProfileImgAsync(uri) {
    let fileType = uri.substr(uri.length - 3)
    let formData = new FormData()
    formData.append('file', {
      uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`
    })
    AsyncStorage.multiGet([USER_TOKEN, USER_REFRESH_TOKEN]).then((data) => {
      fetch(api.uploadingProfileImg(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data[0][1]}`,
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      })
        .then((response) => response.json())
        .then((responseData) => {
          if (responseData.success) {
            this.getCurrentUserProfile()
            this.setState({ uploadingProfileImg: false })
          }
          else {
            handleTokenExpiration(this.props.navigation, () => {
              this.pickProfileImg().then(() => {
                this.setState({ uploadingProfileImg: false })
              })
            })
          }
        })
        .catch(error => {
        })
    })
  }


  triggerChildAlert() {
    this.refs.child.serverErrorAlert()
  }

  render() {
    return (
      Platform.OS === 'ios' ?
        <KeyboardAvoidingView
          behavior="position"
          contentContainerStyle={{ flex: 1 }}
          style={{ flex: 1 }}
        >
          <ParallaxScrollView
            backgroundColor="#61C7E7"
            contentBackgroundColor="#EDEDED"
            keyboardShouldPersistTaps='handled'
            fadeOutForeground
            renderBackground={() => {
              return (this.state.currentUserProfileData ?
                <View key="background">
                  <Image
                    source={{
                      uri: avatarBaseUrl + this.state.currentUserProfileData.user.backgroundImageUrl,
                      width: window.width,
                      height: PARALLAX_HEADER_HEIGHT
                    }}
                    resizeMode='cover'
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      width: window.width,
                      backgroundColor: 'transparent',
                      height: PARALLAX_HEADER_HEIGHT
                    }}
                  >
                  </View>
                </View>
                : null)
            }
            }
            parallaxHeaderHeight={PARALLAX_HEADER_HEIGHT}
            renderForeground={() => (
              <View style={styles.cover}>
                <ActivityIndicator
                  animating={this.state.uploadingBackgroundImg}
                  size='large'
                  color='#61c7e7'
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                />
                <View style={styles.editProfile}>
                  <TouchableHighlight style={styles.backButton}>
                    <MaterialIcons
                      name='keyboard-arrow-left'
                      color='#FFFFFF' size={35}
                      onPress={() => { this.props.navigation.goBack() }}
                    />
                  </TouchableHighlight>
                  <View style={styles.titleContainer}>
                    <Text style={styles.title}>My Profile</Text>
                  </View>
                  <TouchableHighlight
                    style={styles.backgroundCameraWrapper}
                    underlayColor='transparent'
                    onPress={() => this.setState({ uploadingBackgroundImg: true }, () => this.pickBackgroundImg())}
                  >
                    <MaterialIcons name="photo-camera" size={25} style={styles.camera} />
                  </TouchableHighlight>
                </View>
              </View>
            )}>
            <View style={styles.mainContent}>
              <View style={styles.insideContainer}>
                <View style={styles.insideContainerWrapper}>
                  <View style={styles.userProfileImageWrapper}>
                    <View style={styles.userProfileImage}>
                      {
                        this.state.currentUserProfileData ?
                          <ImageBackground
                            style={styles.userImage}
                            source={{ uri: avatarBaseUrl + this.state.currentUserProfileData.user.avatarUrl }}
                            resizeMode='contain'
                          >
                            <TouchableHighlight
                              style={styles.userCameraWrapper}
                              underlayColor='transparent'
                              onPress={() => this.setState({ uploadingProfileImg: true }, () => this.pickProfileImg())}
                            >
                              <MaterialIcons name="photo-camera" size={25} style={styles.camera} />
                            </TouchableHighlight>
                            <ActivityIndicator
                              animating={this.state.uploadingProfileImg}
                              size='large'
                              color='#61c7e7'
                              style={{
                                position: 'absolute',
                                left: 50,
                                right: 50,
                                top: 0,
                                bottom: 0,
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            />
                          </ImageBackground>
                          : null
                      }
                    </View>
                  </View>
                  <View style={styles.inputsContainer}>
                    <View style={styles.name}>
                      <Text style={styles.nameText}>First Name</Text>
                      <TextInput
                        defaultValue={this.state.firstName}
                        style={styles.nameInput}
                        returnKeyType={'done'}
                        onChangeText={(text) => this.setState({ firstName: text })}
                        onSubmitEditing={text => this.saveUserProfile()}
                        underlineColorAndroid='rgba(0,0,0,0)'
                      />
                    </View>
                    {
                      this.state.firstNameErrorMessage ? <Text style={styles.error}>{this.state.firstNameErrorMessage}</Text> : null
                    }
                  </View>
                  <View style={styles.inputsContainer}>
                    <View style={styles.name}>
                      <Text style={styles.nameText}>Last Name</Text>
                      <TextInput
                        defaultValue={this.state.lastName}
                        style={styles.nameInput}
                        returnKeyType={'done'}
                        onChangeText={(text) => this.setState({ lastName: text })}
                        onSubmitEditing={text => this.saveUserProfile()}
                        underlineColorAndroid='rgba(0,0,0,0)'
                      />
                    </View>
                    {
                      this.state.lastNameErrorMessage ? <Text style={styles.error}>{this.state.lastNameErrorMessage}</Text> : null
                    }
                  </View>
                  <View style={styles.inputsContainer}>
                    <View style={styles.name}>
                      <Text style={styles.nameText}>Title</Text>
                      <TextInput
                        defaultValue={this.state.title}
                        style={styles.nameInput}
                        returnKeyType={'done'}
                        onChangeText={(text) => this.setState({ title: text })}
                        onSubmitEditing={text => this.saveUserProfile()}
                        underlineColorAndroid='rgba(0,0,0,0)'
                      />
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.additionalInfo}>
                <View style={styles.AdditionalWrapper}>
                  <View style={styles.inputsContainer}>
                    <View style={styles.name}>
                      <Text style={styles.nameText}>My History</Text>
                      <TextInput
                        defaultValue={this.state.history ?
                          this.state.history : ''}
                        placeholder={this.state.history ?
                          '' : 'Enter your History'}
                        placeholderTextColor="#DADADA"
                        multiline
                        autoGrow
                        onFocus={() => this.setState({ showHistoryBtn: true })}
                        onBlur={() => this.setState({ showHistoryBtn: false })}
                        maxLength={1000}
                        style={styles.quoteInput}
                        onChangeText={(text) => this.setState({ history: text })}
                        underlineColorAndroid='rgba(0,0,0,0)'
                      />
                      {
                        this.state.showHistoryBtn ?
                          <Button
                            buttonStyle={styles.historyBtn}
                            color={'#FFFFFF'}
                            backgroundColor={'#61c7e7'}
                            onPress={text => this.saveUserProfile()}
                            underlayColor='transparent'
                            title={'Done'}
                          />
                          : null
                      }
                    </View>
                  </View>
                  <View style={styles.inputsContainer}>
                    <View style={styles.interests}>
                      <Text style={styles.nameText}>My Interests</Text>
                      {
                        this.state.currentUserProfileData ?
                          <InterestsInput
                            defaultInterests={this.state.currentUserInterests}
                            interestsSuggetions={this.state.interestsSuggestions}
                            interestsInputClear={this.state.clearInterestsInput}
                            clearInput={() => this.setState({ clearInterestsInput: false })}
                            handleXClick={(interestId, interest) => this.handleInterestXClick(interestId, interest)}
                            handleInputWord={(text) =>
                              this.setState({
                                currentInterestsInputWord: text,
                                clearInterestsInput: false
                              }, () =>
                                  this.handleInterestInputWord(this.state.currentInterestsInputWord))}
                            handleKeyboardReturnClick={() => this.handleKeyboardReturnClickInterest()}
                            handleInterestClick={(selectedInterestId, selectedInterest) => this.handleInterestClick(selectedInterestId, selectedInterest)}
                          />
                          : null
                      }
                      {
                        this.state.interestsErrorMessage ? <Text style={styles.error}>{this.state.interestsErrorMessage}</Text> : null
                      }
                    </View>
                  </View>
                  <View style={[styles.inputsContainer, { zIndex: -1 }]}>
                    <View style={styles.responsibilities}>
                      <Text style={styles.nameText}>Responsibilities</Text>
                      {
                        this.state.currentUserProfileData ?
                          <ResponsibilitiesInput
                            defaultResponsibilities={this.state.currentUserResponsibilities}
                            responsibilitiesSuggetions={this.state.responsibilitiesSuggestions}
                            responsibilitiesInputClear={this.state.clearResponsibilitiesInput}
                            clearInput={() => this.setState({ clearResponsibilitiesInput: false })}
                            handleXClick={(responsibilityId, responsibility) => this.handleResponsibilityXClick(responsibilityId, responsibility)}
                            handleInputWord={(text) =>
                              this.setState({
                                currentResponsibilitiesInputWord: text,
                                clearResponsibilitiesInput: false
                              }, () =>
                                  this.handleResponsibilityInputWord(this.state.currentResponsibilitiesInputWord))}
                            handleKeyboardReturnClick={() => this.handleKeyboardReturnClickResponsibility()}
                            handleResponsibilityClick={(selectedResponsibilityId, selectedResponsibility) => this.handleResponsibilityClick(selectedResponsibilityId, selectedResponsibility)}
                          />
                          : null
                      }
                      {
                        this.state.responsibilitiesErrorMessage ? <Text style={styles.error}>{this.state.responsibilitiesErrorMessage}</Text> : null
                      }
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </ParallaxScrollView>
        </KeyboardAvoidingView>
        :
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps='handled'
        >
          {
            this.state.currentUserProfileData ?
              <View>
                <ImageBackground
                  source={
                    this.state.currentUserProfileData.user.backgroundImageUrl ?
                    { uri: avatarBaseUrl + this.state.currentUserProfileData.user.backgroundImageUrl }:
                    require('../../assets/images/default-cover.jpg')}
                  resizeMode='cover'
                  style={{ width: window.width, height: PARALLAX_HEADER_HEIGHT }}
                >
                  <View style={styles.cover}>
                    <ActivityIndicator
                      animating={this.state.uploadingBackgroundImg}
                      size='large'
                      color='#61c7e7'
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    />
                    <View style={styles.editProfile}>
                      <TouchableHighlight style={styles.backButton}>
                        <MaterialIcons
                          name='keyboard-arrow-left'
                          color='#FFFFFF'
                          size={35}
                          onPress={() => { this.props.navigation.goBack() }}
                        />
                      </TouchableHighlight>
                      <View style={styles.titleContainer}>
                        <Text style={styles.title}>My Profile</Text>
                      </View>
                      <TouchableHighlight
                        style={styles.backgroundCameraWrapper}
                        underlayColor='transparent'
                        onPress={() => this.setState({ uploadingBackgroundImg: true }, () => this.pickBackgroundImg())}
                      >
                        <MaterialIcons
                          name="photo-camera"
                          size={25}
                          style={styles.camera}
                        />
                      </TouchableHighlight>
                    </View>
                    <View style={{ position: 'absolute', bottom: -15, left: 0, right: 0, zIndex: 1000 }}>
                      <View style={styles.userProfileImage}>
                        {
                          this.state.currentUserProfileData ?
                            <ImageBackground
                              style={styles.userImage}
                              source={
                                this.state.currentUserProfileData.user.avatarUrl ?
                                { uri: avatarBaseUrl + this.state.currentUserProfileData.user.avatarUrl }:
                                require('../../assets/images/profile-default.png')
                                }
                              resizeMode='contain'
                            >
                              <TouchableHighlight
                                style={styles.userCameraWrapper}
                                underlayColor='transparent'
                                onPress={() => this.setState({ uploadingProfileImg: true }, () => this.pickProfileImg())}
                              >
                                <MaterialIcons
                                  name="photo-camera"
                                  size={25}
                                  style={styles.camera}
                                />
                              </TouchableHighlight>
                              <ActivityIndicator
                                animating={this.state.uploadingProfileImg}
                                size='large'
                                color='#61c7e7'
                                style={{
                                  position: 'absolute',
                                  left: 50,
                                  right: 50,
                                  top: 0,
                                  bottom: 0,
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              />
                            </ImageBackground>
                            : null
                        }
                      </View>
                    </View>
                  </View>
                </ImageBackground>
                <View style={styles.mainContent}>
                  <View style={styles.insideContainer}>
                    <View style={styles.insideContainerWrapper}>
                      <View style={styles.inputsContainer}>
                        <View style={styles.name}>
                          <Text style={styles.nameText}>First Name</Text>
                          <TextInput
                            defaultValue={this.state.firstName}
                            style={styles.nameInput}
                            returnKeyType={'done'}
                            onChangeText={(text) => this.setState({ firstName: text })}
                            onSubmitEditing={text => this.saveUserProfile()}
                            underlineColorAndroid='rgba(0,0,0,0)'
                          />
                        </View>
                        {
                          this.state.firstNameErrorMessage ? <Text style={styles.error}>{this.state.firstNameErrorMessage}</Text> : null
                        }
                      </View>
                      <View style={styles.inputsContainer}>
                        <View style={styles.name}>
                          <Text style={styles.nameText}>Last Name</Text>
                          <TextInput
                            defaultValue={this.state.lastName}
                            style={styles.nameInput}
                            returnKeyType={'done'}
                            onChangeText={(text) => this.setState({ lastName: text })}
                            onSubmitEditing={text => this.saveUserProfile()}
                            underlineColorAndroid='rgba(0,0,0,0)'
                          />
                        </View>
                        {
                          this.state.lastNameErrorMessage ? <Text style={styles.error}>{this.state.lastNameErrorMessage}</Text> : null
                        }
                      </View>
                      <View style={styles.inputsContainer}>
                        <View style={styles.name}>
                          <Text style={styles.nameText}>Title</Text>
                          <TextInput
                            defaultValue={this.state.title}
                            style={styles.nameInput}
                            returnKeyType={'done'}
                            onChangeText={(text) => this.setState({ title: text })}
                            onSubmitEditing={text => this.saveUserProfile()}
                            underlineColorAndroid='rgba(0,0,0,0)'
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.additionalInfo}>
                    <View style={[styles.inputsContainer, { width: '100%' }]}>
                      <Text style={styles.nameText}>My History</Text>
                      <TextInput
                        defaultValue={this.state.history ?
                          this.state.history : ''}
                        placeholder={this.state.history ?
                          '' : 'Enter your History'}
                        placeholderTextColor="#DADADA"
                        multiline
                        autoGrow
                        onFocus={() => this.setState({ showHistoryBtn: true })}
                        onBlur={() => this.setState({ showHistoryBtn: false })}
                        maxLength={1000}
                        style={styles.quoteInput}
                        onChangeText={(text) => this.setState({ history: text })}
                        underlineColorAndroid='rgba(0,0,0,0)'
                      />
                      {
                        this.state.showHistoryBtn ?
                          <Button
                            buttonStyle={styles.historyBtn}
                            color={'#FFFFFF'}
                            backgroundColor={'#61c7e7'}
                            onPress={text => this.saveUserProfile()}
                            underlayColor='transparent'
                            title={'Done'}
                          />
                          : null
                      }
                    </View>
                    <View style={styles.inputsContainer}>
                      <View style={styles.interests}>
                        <Text style={styles.nameText}>My Interests</Text>
                        {
                          this.state.currentUserProfileData ?
                            <InterestsInput
                              defaultInterests={this.state.currentUserInterests}
                              interestsSuggetions={this.state.interestsSuggestions}
                              interestsInputClear={this.state.clearInterestsInput}
                              clearInput={() => this.setState({ clearInterestsInput: false })}
                              handleXClick={(interestId, interest) => this.handleInterestXClick(interestId, interest)}
                              handleInputWord={(text) =>
                                this.setState({
                                  currentInterestsInputWord: text,
                                  clearInterestsInput: false
                                }, () =>
                                    this.handleInterestInputWord(this.state.currentInterestsInputWord))}
                              handleKeyboardReturnClick={() => this.handleKeyboardReturnClickInterest()}
                              handleInterestClick={(selectedInterestId, selectedInterest) => this.handleInterestClick(selectedInterestId, selectedInterest)}
                            />
                            : null
                        }
                        {
                          this.state.interestsErrorMessage ? <Text style={styles.error}>{this.state.interestsErrorMessage}</Text> : null
                        }
                      </View>
                    </View>
                    <View style={[styles.inputsContainer, { zIndex: -1 }]}>
                      <View style={styles.responsibilities}>
                        <Text style={styles.nameText}>Responsibilities</Text>
                        {
                          this.state.currentUserProfileData ?
                            <ResponsibilitiesInput
                              defaultResponsibilities={this.state.currentUserResponsibilities}
                              responsibilitiesSuggetions={this.state.responsibilitiesSuggestions}
                              responsibilitiesInputClear={this.state.clearResponsibilitiesInput}
                              clearInput={() => this.setState({ clearResponsibilitiesInput: false })}
                              handleXClick={(responsibilityId, responsibility) => this.handleResponsibilityXClick(responsibilityId, responsibility)}
                              handleInputWord={(text) =>
                                this.setState({
                                  currentResponsibilitiesInputWord: text,
                                  clearResponsibilitiesInput: false
                                }, () =>
                                    this.handleResponsibilityInputWord(this.state.currentResponsibilitiesInputWord))}
                              handleKeyboardReturnClick={() => this.handleKeyboardReturnClickResponsibility()}
                              handleResponsibilityClick={(selectedResponsibilityId, selectedResponsibility) => this.handleResponsibilityClick(selectedResponsibilityId, selectedResponsibility)}
                            />
                            : null
                        }
                        {
                          this.state.responsibilitiesErrorMessage ? <Text style={styles.error}>{this.state.responsibilitiesErrorMessage}</Text> : null
                        }
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
const PARALLAX_HEADER_HEIGHT = 270

const styles = StyleSheet.create({
  cover: {
    flex: 1
  },
  editProfile: {
    backgroundColor: 'transparent',
    zIndex: 1,
    marginTop: 40,
    backgroundColor: '#61c7e7',
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: {
    flex: 1
  },
  titleContainer: {
    flex: 0
  },
  title: {
    alignSelf: 'center',
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'Lato-Bold'
  },
  backgroundCameraWrapper: {
    flex: 1,
    alignItems: 'flex-end'
  },
  camera: {
    color: '#FFFFFF',
    justifyContent: 'center'
  },
  mainContent: {
    marginTop: -30,
    marginBottom: 70
  },
  insideContainer: {
    alignItems: 'center',
    height: 275
  },
  insideContainerWrapper: {
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
    top: -75,
    left: 0,
    right: 0,
    zIndex: 1000
  },
  userProfileImage: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    padding: 5,
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  userImage: {
    width: '100%',
    height: '100%',
    borderRadius: 3
  },
  userCameraWrapper: {
    position: 'absolute',
    right: 5,
    top: 5
  },
  inputsContainer: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    marginTop: 25
  },
  name: {
  },
  nameText: {
    color: '#000000',
    fontSize: 12
  },
  nameInput: {
    marginTop: 10,
    borderBottomColor: '#6f6f6f',
    borderBottomWidth: 1,
    color: '#000000',
    opacity: 0.6,
    paddingBottom: 5,
  },
  additionalInfo: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    alignContent: 'center'
  },
  AdditionalWrapper: {
    flex: 1
  },
  quoteInput: {
    fontSize: 16,
    marginTop: 10,
    paddingBottom: 5,
    borderBottomColor: '#6f6f6f',
    borderBottomWidth: 1,
    color: '#000000',
    opacity: 0.6,
    textAlignVertical: 'top'
  },
  historyBtn: {
    marginTop: 5,
    marginHorizontal: -15
  },
  interests: {
  },
  responsibilities: {
    paddingTop: 20
  },
  error: {
    color: '#D50048',
    fontSize: 14,
    zIndex: -1
  }
})