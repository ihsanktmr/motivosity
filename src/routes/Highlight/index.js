import React, { Component } from 'react';
import {
  AsyncStorage,
  Alert,
  Image,
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  Platform
} from 'react-native';
import { SCLAlert, SCLAlertButton } from 'react-native-scl-alert';
import axios from 'axios';
import api from '../../utils/api';
import ImagePicker from 'react-native-image-picker';
import { handleTokenExpiration } from '../../utils/tokenExpiration';
import GiveNowBtn from '../../components/GiveNowBtn';
import ServerError from '../../components/ServerError';
import { Button } from 'react-native-elements';
const CURRENCY_SYMBOL = 'company_currency_symbol';

export default class Thanks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageURL: '',
      currencySymbol: '$',
      searchInputText: '',
      wdyaUserQuery: '',
      taggedUser: [],
      thanksText: '',
      companyValuesArray: [],
      companyValueNamesArray: [],
      selectedCompanyValueID: null,
      companyValue: 'Company Values',
      valuesDropdownClicked: false,
      userCashGiving: null,
      userCashSpending: null,
      givingClicked: false,
      spendingClicked: false,
      GivingBackgrnColor: '#66C7E5',
      SpendingBackgrnColor: '#66C7E5',
      bonusAmount: 0,
      bonusInputClear: false,
      timeout: null,
      privateClicked: false,
      searchUserResults: [],
      disableBtn: false,
      userInputError: '',
      userNoteError: '',
      userLinkError: '',
      userBonusError: '',
      serverError: false,
      disclaimerText: '',
      show: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.screenProps.currentScreen === 'Thanks' &&
      nextProps.screenProps.currentScreen !==
        this.props.screenProps.currentScreen
    ) {
      this.setState(
        {
          wdyaUserQuery: '',
          taggedUser: [],
          thanksText: '',
          selectedCompanyValueID: null,
          companyValue: 'Company Values',
          bonusAmount: 0,
          bonusInputClear: true,
          givingClicked: false,
          spendingClicked: false,
          privateClicked: false,
          userInputError: '',
          userNoteError: '',
          userBonusError: ''
        },
        () =>
          AsyncStorage.getItem(CURRENCY_SYMBOL).then(data =>
            this.setState({ currencySymbol: data })
          ),
        this.getCompanyValues()
      );
      this.clearNoteInput(); // clears Thanks(note) text input
      this.lookaheadFilter.select(-1);
    }
  }

  async componentDidMount() {
    this.getDisclaimer();
  }
  async getCompanyValues() {
    try {
      const response = await axios.get(api.companyValues());

      this.setCompanyValues(response.data.response);
    } catch (error) {
      if (error.response.status >= 500) {
        this.setState(
          {
            serverError: true
          },
          () => this.triggerChildAlert()
        );
      } else {
        const tokenError = await handleTokenExpiration();
        !tokenError
          ? await this.getCompanyValues()
          : this.setState(
              {
                serverError: true
              },
              () => this.triggerChildAlert(),
              setTimeout(() => {
                this.props.navigation.navigate('Logout');
              }, 4000)
            );
      }
    }
  }

  setCompanyValues(valuesArray) {
    var names = valuesArray.map(data => data.name);
    this.setState(
      {
        companyValuesArray: valuesArray,
        companyValueNamesArray: names
      },
      () => this.getUserCash()
    );
  }

  async getUserCash() {
    try {
      const response = await axios.get(api.userCash());
      this.setState({
        userCashGiving: response.data.response.cashGiving,
        userCashSpending: response.data.response.cashReceiving
      });
    } catch (error) {
      if (error.response.status >= 500) {
        this.setState(
          {
            serverError: true
          },
          () => this.triggerChildAlert()
        );
      } else {
        const tokenError = await handleTokenExpiration();
        !tokenError
          ? await this.getUserCash()
          : this.setState(
              {
                serverError: true
              },
              () => this.triggerChildAlert(),
              setTimeout(() => {
                this.props.navigation.navigate('Logout');
              }, 4000)
            );
      }
    }
  }

  onChangeTags = taggedUser => {
    this.setState({
      taggedUser
    });
  };

  timeoutPromise(time) {
    return new Promise(function(resolve) {
      setTimeout(resolve, time);
    });
  }

  async handleInputWord(inputWord) {
    if (inputWord) {
      try {
        // setTimeut here for 800 seconds
        await this.timeoutPromise(800);
        const response = await axios.get(
          api.usersList() + '?name=' + inputWord + '&ignoreSelf=true'
        );

        this.filterSearch(response.data.response, inputWord);
      } catch (error) {
        if (error.response.status === 401) {
          const tokenError = await handleTokenExpiration();
          !tokenError
            ? await this.handleInputWord(this.state.searchInputText)
            : this.setState(
                {
                  serverError: true
                },
                () => this.triggerChildAlert(),
                setTimeout(() => {
                  this.props.navigation.navigate('Logout');
                }, 4000)
              );
        } else if (error.response.status >= 500) {
          this.setState(
            {
              serverError: true
            },
            () => this.triggerChildAlert()
          );
        } else {
          this.setState({
            userInputError: error.response.data.mvMessages[0].message
          });
        }
      }
    } else {
      this.setState({
        searchUserResults: [],
        wdyaUserQuery: '',
        userInputError: ''
      });
    }
  }

  filterSearch(searchResults, inputWord) {
    var taggedUsers = [...this.state.taggedUser];
    if (!searchResults.length) {
      this.setState({
        userInputError: 'Sorry, we could not find this person'
      });
    }
    var uniqueResults = searchResults.filter(function(obj) {
      return !taggedUsers.some(function(obj2) {
        return obj.fullName == obj2.fullName;
      });
    });
    this.setState({
      searchUserResults: [...uniqueResults],
      wdyaUserQuery: inputWord
    });
  }

  handleUserSearchClick(index) {
    this.setState({
      taggedUser: [
        ...this.state.taggedUser,
        this.state.searchUserResults[index]
      ],
      searchUserResults: [],
      wdyaUserQuery: '',
      userInputError: ''
    });
  }

  handleXClick(index) {
    var taggedUserCopy = [...this.state.taggedUser];
    var removedTaggedUsersArray = taggedUserCopy.filter(
      user => user !== taggedUserCopy[index]
    );
    this.setState({
      taggedUser: removedTaggedUsersArray
    });
  }

  valueIdentification(index, selectedValue) {
    var selectedValueID;
    var companyValuesArrayCopy = [...this.state.companyValuesArray];
    for (var i = 0; i < companyValuesArrayCopy.length; i++) {
      if (index == i) {
        selectedValueID = companyValuesArrayCopy[i].id;
      }
    }
    this.setState({
      companyValue: selectedValue,
      selectedCompanyValueID: selectedValueID
    });
  }

  storeBonusAmount(num) {
    this.setState({
      bonusAmount: num
    });
  }

  handleGivingBonus() {
    this.setState({
      givingClicked: true,
      spendingClicked: false,
      GivingBackgrnColor: '#2B7298',
      SpendingBackgrnColor: '#66C7E5'
    });
  }

  handleSpendingBonus() {
    this.setState({
      spendingClicked: true,
      givingClicked: false,
      GivingBackgrnColor: '#66C7E5',
      SpendingBackgrnColor: '#2B7298'
    });
  }

  handlePrivate() {
    this.setState({
      privateClicked: !this.state.privateClicked
    });
  }

  async handleGiveNowClick() {
    var taggedUserCopy = [...this.state.taggedUser];
    var userIDs = taggedUserCopy.map(val => val.id);
    this.setState({ show: true });

    let body = {
      toUserIDs: userIDs,
      note: this.state.thanksText,
      companyValueID: this.state.selectedCompanyValueID
        ? this.state.selectedCompanyValueID
        : '',
      amount: this.state.bonusAmount,
      amountType: this.state.spendingClicked ? 'SM' : 'GM',
      privateAppreciation: this.state.privateClicked ? true : false
    };

    try {
      const response = await axios.put(api.givingAppreciation(), body);
      var taggedUsers = this.state.taggedUser.map(name => name.fullName);
      taggedUsers.length === 1
        ? Alert.alert(
            'Thanks!',
            `${taggedUsers.toString()} has just been notified.`,
            [{ text: 'OK' }],
            { cancelable: false }
          )
        : Alert.alert(
            'Thanks!',
            `${taggedUsers.toString()} have just been notified.`,
            [{ text: 'OK' }],
            { cancelable: false }
          );
      this.setState(
        {
          taggedUser: [],
          thanksText: '',
          selectedCompanyValueID: null,
          companyValue: 'Company Values',
          bonusAmount: 0,
          bonusInputClear: true,
          givingClicked: true,
          spendingClicked: false,
          privateClicked: false,
          disableBtn: false
        },
        () => {
          this.clearNoteInput();
          this.getUserCash();
        }
      );
    } catch (error) {
      if (error.response.status === 401) {
        const tokenError = await handleTokenExpiration();
        !tokenError
          ? await this.handleGiveNowClick()
          : this.setState(
              {
                serverError: true
              },
              () => this.triggerChildAlert(),
              setTimeout(() => {
                this.props.navigation.navigate('Logout');
              }, 4000)
            );
      } else if (error.response.status > 500) {
        this.setState(
          {
            serverError: true
          },
          () => this.triggerChildAlert()
        );
      } else {
        switch (error.response.data.mvMessages[0].key) {
          case 'note':
            this.setState({
              userInputError: '',
              userNoteError: error.response.data.mvMessages[0].message,
              userBonusError: '',
              disableBtn: false
            });
            break;
          case 'toUserID':
            this.setState({
              userInputError: error.response.data.mvMessages[0].message,
              userNoteError: '',
              userBonusError: '',
              disableBtn: false
            });
            break;
          default:
            this.setState({
              userInputError: '',
              userNoteError: '',
              userBonusError: error.response.data.mvMessages[0].message,
              disableBtn: false
            });
        }
      }
    }
  }

  getDisclaimer = async () => {
    try {
      const obj = await axios.get(api.givingAppreciationSetup());
      const { disclaimer } = obj.data.response;
      this.setState({ disclaimerText: disclaimer });
    } catch (error) {}
  };

  clearNoteInput() {
    if (Platform.OS === 'ios') {
      this.noteInput.setNativeProps({ text: ' ' });
    }

    setTimeout(() => {
      this.noteInput.setNativeProps({ text: '' });
    }, 5);
  }

  handleKeyboardReturnClick() {
    this.setState({
      taggedUser: [...this.state.taggedUser, this.state.searchUserResults[0]],
      searchUserResults: [],
      wdyaUserQuery: ''
    });
  }

  triggerChildAlert() {
    this.refs.child.serverErrorAlert();
  }

  pickImg = async () => {
    ImagePicker.showImagePicker({ quality: 0.4, base64: true }, response => {
      if (response.didCancel) {
        this.setState({ uploadingProfileImg: false });
      } else if (response.error) {
        alert('Upload failed, sorry :(');
        this.setState({ uploadingProfileImg: false });
      } else {
        const source = { uri: response.uri };
        this.setState({ imageURL: response.data, source });
      }
    });
  };

  sentHighlights = async () => {
    const {
      storeHighlightsText,
      imageURL,
      storeHighlightsLink,
    } = this.state;
    const body = {
      note: storeHighlightsText,
      url: storeHighlightsLink,
      imageData: imageURL
    };

    this.errorHandler(storeHighlightsText, storeHighlightsLink, body);
  };

  isValidURL = string => {
    var res = string.match(
      /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
    );
    return res !== null;
  };

  errorHandler = async (text, link, body) => {
    if (!text) {
      this.setState({
        userNoteError: 'Add your highlights',
        disableBtn: false
      });
    } else {
      this.setState({ userNoteError: '', userLinkError: '' });
      if (!link || this.isValidURL(link)) {
        try {
          const response = await axios.put(api.givingHighlight(), body);
          this.setState({
            show: true,
            msgType: 'success',
            showMsg: 'Your highlight has been shared',
            titleMsg: 'Success!'
          });
        } catch (error) {
          this.setState({
            show: true,
            disableBtn: false,
            msgType: 'danger',
            showMsg: 'Something went wrong, please try again later',
            titleMsg: 'Oops!'
          });
        }
      } else {
        this.setState({
          userLinkError: 'Please enter a URL including http:// or https://',
          disableBtn: false
        });
      }
    }
  };

  storeHighlightsText(val) {
    this.setState({
      thanksText: val,
      storeHighlightsText: val
    });
  }

  storeHighlightsLink = val => {
    this.setState({
      storeHighlightsLink: val
    });
  };
  alertHandler = data => {
    if (data == 'success') {
      this.setState({ show: false });
      this.props.navigation.goBack();
    } else {
      this.setState({ show: false });
    }
  };

  render() {
    const {
      disclaimerText,
      storeHighlightsText,
      storeHighlightsLink,
      msgType,
      showMsg,
      show,
      titleMsg
    } = this.state;
    return (
      <View style={{ flex: 1, backgroundColor: '#dCf4b0' }}>
        <SCLAlert
          theme={msgType}
          show={show}
          title={titleMsg}
          subtitle={showMsg}
        >
          <SCLAlertButton
            theme={msgType}
            onPress={() => {
              this.alertHandler(msgType);
            }}
          >
            Close
          </SCLAlertButton>
        </SCLAlert>

        <ScrollView keyboardShouldPersistTaps="handled">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.thanksContainer}>
              <View style={styles.container}>
                <View style={styles.titleWrapper}>
                  <Text style={styles.title}>What's your highlight?</Text>
                  <Text style={styles.title2}>
                    What's a good highlight? Something to keep the energy up! A
                    new sale, a discovery, an awesome customer comment.
                  </Text>
                </View>
                <View style={styles.thanksWrapper}>
                  <TextInput
                    style={styles.thanksInput}
                    multiline
                    value={storeHighlightsText}
                    placeholder="Add your  highlight here"
                    placeholderTextColor="#DADADA"
                    onChangeText={text => this.storeHighlightsText(text)}
                    underlineColorAndroid="rgba(0,0,0,0)"
                  />
                  {this.state.userNoteError ? (
                    <Text style={styles.error}>{this.state.userNoteError}</Text>
                  ) : null}
                </View>
                <View style={styles.valuesWrapper}>
                  <Text style={styles.title1}>Link?</Text>
                  <View style={styles.thanksWrapper}>
                    <TextInput
                      style={styles.linkInput}
                      multiline
                      value={storeHighlightsLink}
                      placeholder="Paste your link in here"
                      placeholderTextColor="#DADADA"
                      onChangeText={text => this.storeHighlightsLink(text)}
                      underlineColorAndroid="rgba(0,0,0,0)"
                    />
                    {this.state.userLinkError ? (
                      <Text style={styles.error}>
                        {this.state.userLinkError}
                      </Text>
                    ) : null}
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      marginBottom: 60,
                      marginTop: 30,
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Text style={styles.title1}>Image?</Text>
                    <View
                      style={{
                        width: 170
                      }}
                    >
                      <Button
                        buttonStyle={{
                          backgroundColor: '#B6D882',
                          borderRadius: 5,
                          padding: 5,
                          fontWeight: 'bold',
                          marginRight: -15
                        }}
                        onPress={() => {
                          this.pickImg();
                        }}
                        underlayColor="transparent"
                        title={'ADD AN IMAGE'}
                      />
                    </View>
                  </View>

                  {this.state.imageURL ? (
                    <View
                      style={{
                        justifyContent: 'center',
                        width: '100%',
                        alignItems: 'center'
                      }}
                    >
                      <Image
                        source={this.state.source}
                        style={{
                          width: 230,
                          height: 170,
                          marginTop: -20,
                          marginBottom: 20
                        }}
                      />
                    </View>
                  ) : null}
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 220
                  }}
                >
                  <Text
                    style={{ fontSize: 17, color: '#27719A' }}
                    onPress={() => {
                      this.props.navigation.goBack();
                    }}
                  >
                    Cancel
                  </Text>
                  <GiveNowBtn
                    marginBottom
                    onPress={() => {
                      this.setState({ disableBtn: true }, () =>
                        // this.handleGiveNowClick()
                        this.sentHighlights()
                      );
                    }}
                    disabled={this.state.disableBtn}
                  />
                </View>
              </View>
              {this.state.serverError ? <ServerError ref="child" /> : null}
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </View>
    );
  }
}

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40
  },
  giveNow: {
    backgroundColor: '#212121',
    borderRadius: 5,
    padding: 5
  },
  thanksContainer: {
    alignItems: 'stretch',
    backgroundColor: '#dCf4b0',
    flex: 1,
    padding: 20,
    paddingBottom: 0
  },
  titleWrapper: {
    backgroundColor: '#dCf4b0'
  },
  title: {
    color: '#212121',
    fontSize: 20,
    fontFamily: 'Lato-Bold'
  },
  title1: {
    color: '#212121',
    fontSize: 15,
    fontFamily: 'Lato-Bold'
  },
  title2: {
    color: '#212121',
    fontSize: 15,
    marginTop: 10
  },
  thanksWrapper: {
    marginTop: 18,
    zIndex: -1
  },
  thanksInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#fff',
    borderRadius: 5,
    borderWidth: 2,
    color: '#000000',
    fontSize: 14,
    height: 60,
    paddingHorizontal: 10,
    paddingTop: 10,
    textAlignVertical: 'top'
  },
  linkInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#fff',
    borderRadius: 5,
    borderWidth: 2,
    color: '#000000',
    fontSize: 14,
    height: 40,
    paddingHorizontal: 10,
    paddingTop: 10,
    textAlignVertical: 'top'
  },
  valuesWrapper: {
    marginTop: 30,
    zIndex: -1
  },
  valuesTitle: {
    fontSize: 14
  },
  valuesDropdown: {
    backgroundColor: '#FFFFFF',
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 5,
    padding: 12,
    position: 'relative',
    marginTop: 10
  },
  valuesDropdownList: {
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderRadius: 5,
    borderColor: '#fff',
    marginTop: Platform.OS === 'ios' ? 11 : -10,
    marginLeft: -14,
    width: Platform.OS === 'ios' ? width - width / 9.5 : width - width / 10,
    height: 152
  },
  valuesDropdownListText: {
    color: '#AAAAAA',
    fontSize: 14
  },
  valuesDropdownCurrentText: {
    color: '#000000',
    fontSize: 14,
    marginLeft: Platform.OS === 'ios' ? -3 : 0
  },
  bonusWrapper: {
    marginTop: 30,
    zIndex: -1
  },
  bonusTitle: {
    fontSize: 14,
    width: 80
  },
  bonusInputWrapper: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10
  },
  bonusInput: {
    backgroundColor: '#FFFFFF',
    color: '#AAAAAA',
    fontSize: 14,
    height: 45,
    flex: 1
  },
  useMoney: {
    flexDirection: 'row',
    height: 37,
    justifyContent: 'space-between',
    marginTop: 15
  },
  userGivingWrapper: {
    borderRadius: 3,
    borderColor: 'transparent',
    borderWidth: 3,
    flexBasis: '48%',
    justifyContent: 'flex-start'
  },
  useGiving: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginLeft: 5
  },
  givingText: {
    color: '#FFFFFF',
    fontSize: 12
  },
  userSpendingWrapper: {
    borderRadius: 3,
    borderColor: 'transparent',
    borderWidth: 3,
    flexBasis: '48%',
    justifyContent: 'flex-end'
  },
  useSpending: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginLeft: 5
  },
  spendingText: {
    color: '#FFFFFF',
    fontSize: 12
  },
  privateWrapper: {
    marginTop: 5,
    width: 180,
    zIndex: -1
  },
  giveNowWrapper: {
    marginTop: 15,
    zIndex: -1
  },
  giveNow: {
    alignItems: 'center',
    backgroundColor: '#66C7E5',
    flexDirection: 'row',
    borderRadius: 3,
    height: 50,
    justifyContent: 'center',
    width: '100%'
  },
  giveNowText: {
    color: '#FFFFFF',
    fontSize: 20
  },
  error: {
    color: '#D50048',
    fontSize: 14,
    marginTop: 5
  },
  textStyleNew: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '200',
    marginLeft: 5
  }
});
