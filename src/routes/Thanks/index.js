import React, {Component} from "react";
import {
  AsyncStorage,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import axios from "axios";
import api from "../../utils/api";

import {SCLAlert, SCLAlertButton} from 'react-native-scl-alert';
import ModalDropdown from 'react-native-modal-dropdown'
import SimpleLineIcons from 'react-native-vector-icons/Ionicons'

import CheckBox from "react-native-check-box";

import {handleTokenExpiration} from "../../utils/tokenExpiration";

import UserSearchInput from "../../components/UserSearchInput";
import DollarInput from "../../components/DollarInput";
import GiveNowBtn from "../../components/GiveNowBtn";
import ServerError from "../../components/ServerError";

const CURRENCY_SYMBOL = "company_currency_symbol";

export default class Thanks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currencySymbol: "$",
      searchInputText: "",
      wdyaUserQuery: "",
      taggedUser: [],
      thanksText: "",
      companyValuesArray: [],
      companyValueNamesArray: [],
      selectedCompanyValueID: null,
      companyValue: 'Select a value',
      valuesDropdownClicked: false,
      userCashGiving: null,
      userCashSpending: null,
      givingClicked: true,
      spendingClicked: false,
      GivingBackgrnColor: "#66C7E5",
      SpendingBackgrnColor: "#66C7E5",
      bonusAmount: 0,
      bonusInputClear: false,
      timeout: null,
      privateClicked: false,
      searchUserResults: [],
      disableBtn: false,
      userInputError: "",
      userNoteError: "",
      userBonusError: "",
      serverError: false,
      disclaimerText: "",
      show: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.screenProps.currentScreen === 'Thanks' && nextProps.screenProps.currentScreen !== this.props.screenProps.currentScreen)) {
      this.setState({
          wdyaUserQuery: '',
          taggedUser: [],
          thanksText: '',
          selectedCompanyValueID: null,
          companyValue: 'Select a value',
          bonusAmount: 0,
          bonusInputClear: true,
          givingClicked: true,
          spendingClicked: false,
          privateClicked: false,
          userInputError: '',
          userNoteError: '',
          userBonusError: ''
        }, () =>
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
    this.getDisclaimer()
    this.setState({ searchInputText: this.props.navigation.state.params })
    if (this.props.navigation.state.params) {
      await this.handleInputWord(this.props.navigation.state.params.fullName)
      this.handleUserSearchClick(0)
    }
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
            this.props.navigation.navigate("Logout");
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
        userCashGiving: response.data.response.cashGiving || 0,
        userCashSpending: response.data.response.cashReceiving || 0
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
            this.props.navigation.navigate("Logout");
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
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  async handleInputWord(inputWord) {
    if (inputWord) {
      try {
        // setTimeut here for 800 seconds
        await this.timeoutPromise(800);
        const response = await axios.get(
          api.usersList() + "?name=" + inputWord + "&ignoreSelf=true"
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
              this.props.navigation.navigate("Logout");
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
        wdyaUserQuery: "",
        userInputError: ""
      });
    }
  }

  filterSearch(searchResults, inputWord) {
    var taggedUsers = [...this.state.taggedUser];
    if (!searchResults.length) {
      this.setState({
        userInputError: "Sorry, we could not find this person"
      });
    }
    //compare the difference between already tagged users and search results from fetch(from handleInputWord)
    var uniqueResults = searchResults.filter(function (obj) {
      return !taggedUsers.some(function (obj2) {
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
      userInputError: '',
    })
  }

  handleXClick(index) {
    var taggedUserCopy = [...this.state.taggedUser];
    var removedTaggedUsersArray = taggedUserCopy.filter(
      user => user !== taggedUserCopy[index]
    );
    this.setState({
      taggedUser: removedTaggedUsersArray,
    })
  }

  storeThanksText(val) {
    this.setState({
      thanksText: val
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
      GivingBackgrnColor: "#2B7298",
      SpendingBackgrnColor: "#66C7E5"
    });
  }

  handleSpendingBonus() {
    this.setState({
      spendingClicked: true,
      givingClicked: false,
      GivingBackgrnColor: "#66C7E5",
      SpendingBackgrnColor: "#2B7298"
    });
  }

  handlePrivate() {
    this.setState({
      privateClicked: !this.state.privateClicked
    });
  }

  async handleGiveNowClick() {
    const taggedUserCopy = [...this.state.taggedUser];
    const userIDs = taggedUserCopy.map(val => val.id);

    let body = {
      toUserIDs: userIDs,
      note: this.state.thanksText,
      companyValueID: this.state.selectedCompanyValueID
        ? this.state.selectedCompanyValueID
        : "",
      amount: this.state.bonusAmount,
      amountType: this.state.spendingClicked ? "SM" : "GM",
      privateAppreciation: this.state.privateClicked
    };

    try {
      const response = await axios.put(api.givingAppreciation(), body);
      const taggedUsers = this.state.taggedUser.map(name => name.fullName);

      this.setState({
        show: true,
        msgType: 'success',
        showMsg: taggedUsers.length === 1 ? `${taggedUsers.toString()} has just been notified.` : `${taggedUsers.toString()} have just been notified.`,
        titleMsg: 'Success!',

        taggedUser: [],
        thanksText: '',
        selectedCompanyValueID: null,
        companyValue: 'Select a value',
        bonusAmount: 0,
        bonusInputClear: true,
        givingClicked: true,
        spendingClicked: false,
        privateClicked: false,
        disableBtn: false
      }, () => {
        this.clearNoteInput()
        this.getUserCash()

      })
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
            this.props.navigation.navigate("Logout");
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
          case "note":
            this.setState({
              userInputError: "",
              userNoteError: error.response.data.mvMessages[0].message,
              userBonusError: "",
              disableBtn: false
            });
            break;
          case "toUserID":
            this.setState({
              userInputError: error.response.data.mvMessages[0].message,
              userNoteError: "",
              userBonusError: "",
              disableBtn: false
            });
            break;
          default:
            this.setState({
              userInputError: "",
              userNoteError: "",
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
      const { disclaimer } = obj.data.response
      this.setState({ disclaimerText: disclaimer })

    } catch (error) {
    }
  };

  clearNoteInput() {
    if (Platform.OS === "ios") {
      this.noteInput.setNativeProps({ text: " " });
    }

    setTimeout(() => {
      this.noteInput.setNativeProps({ text: "" });
    }, 5);
  }

  handleKeyboardReturnClick() {
    this.setState({
      taggedUser: [...this.state.taggedUser, this.state.searchUserResults[0]],
      searchUserResults: [],
      wdyaUserQuery: '',
      searchInputText: ''
    })
  }

  triggerChildAlert() {
    this.refs.child.serverErrorAlert();
  }

  alertHandler = data => {
    if (data === 'success') {
      this.setState({ show: false });
      this.props.navigation.goBack();
    } else {
      this.setState({ show: false });
    }
  };

  render() {
    const {
      disclaimerText,
      msgType,
      showMsg,
      show,
      titleMsg
    } = this.state;
    return (
      <View style={{ flex: 1, backgroundColor: '#d5eff8' }}>
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

        <ScrollView keyboardShouldPersistTaps='handled'>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.thanksContainer}>
              <View style={styles.container}>
                <View style={styles.titleWrapper}>
                  <Text style={styles.title}>Who do you appreciate?</Text>
                </View>
                <UserSearchInput
                  text={this.state.searchInputText}
                  taggedUser={this.state.taggedUser}
                  wdyaUserQuery={this.state.wdyaUserQuery}
                  searchUserResults={this.state.searchUserResults}
                  errorMessage={this.state.userInputError}
                  handleXClick={(index) => this.handleXClick(index)}
                  handleInputWord={(text) => this.setState({ searchInputText: text }, () => this.handleInputWord(this.state.searchInputText))}
                  handleKeyboardReturnClick={() => this.handleKeyboardReturnClick()}
                  handleUserSearchClick={(index) => { this.handleUserSearchClick(index); this.setState({ searchInputText: '' }) }}
                />
                <View style={styles.thanksWrapper}>
                  <TextInput
                    style={styles.thanksInput}
                    multiline
                    ref={input => { this.noteInput = input }}
                    placeholder="Say thanks here"
                    placeholderTextColor="#c3c3c3"
                    onChangeText={text => this.storeThanksText(text)}
                    underlineColorAndroid='rgba(0,0,0,0)'
                  />
                  {this.state.userNoteError ? <Text style={styles.error}>{this.state.userNoteError}</Text> : null}
                </View>
                {disclaimerText ? <Text style={styles.textStyleNew}>Note: {disclaimerText}</Text> : null}
                <View style={styles.valuesWrapper}>
                  <Text style={styles.title1}>What value was demonstrated?</Text>

                  <ModalDropdown
                    ref={(ref) => this.lookaheadFilter = ref}
                    options={this.state.companyValueNamesArray}
                    defaultValue={this.state.companyValueNamesArray[0]}
                    style={styles.valuesDropdown}
                    dropdownStyle={styles.valuesDropdownList}
                    dropdownTextStyle={styles.valuesDropdownListText}
                    dropdownTextHighlightStyle={{ color: '#000000' }}
                    onDropdownWillShow={() =>
                      this.setState({ valuesDropdownClicked: !this.state.valuesDropdownClicked }, () => this.noteInput.blur())}
                    onDropdownWillHide={() =>
                      this.setState({ valuesDropdownClicked: !this.state.valuesDropdownClicked })}
                    onSelect={(index, value) => this.valueIdentification(index, value)}
                  >
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={[styles.valuesDropdownCurrentText,
                        { color: this.state.companyValue === "Select a value" ? "#c3c3c3" : "black" }]}>
                        {this.state.companyValue}
                      </Text>
                      <View style={{ position: 'absolute', right: 0, top: 2 }}>
                        {
                          this.state.valuesDropdownClicked ?
                            <SimpleLineIcons name="ios-arrow-up" size={15} />
                            : <SimpleLineIcons name="ios-arrow-down" size={15} />
                        }
                      </View>
                    </View>
                  </ModalDropdown>
                </View>
                <View style={styles.bonusWrapper}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.title1}>Give a bonus? </Text>
                    { this.state.userCashGiving || this.state.userCashSpending ?
                      <Text style={styles.title2}>
                        (Amount available: ${this.state.givingClicked ? this.state.userCashGiving : this.state.userCashSpending})
                      </Text>
                      :
                      null
                    }
                  </View>
                  {this.state.userBonusError ? <Text>{this.state.userBonusError}</Text> : null}
                  <View style={{ flexDirection: 'row' }}>
                    <View>
                      <DollarInput
                        currencySymbol={this.state.currencySymbol}
                        bonusAmount={this.state.bonusAmount}
                        storeBonusAmount={(number) => this.storeBonusAmount(number)}
                        bonusInputClear={this.state.bonusInputClear}
                        clearInput={() => this.setState({ bonusInputClear: false })}
                      />
                    </View>
                    <View style={styles.privateWrapper}>
                      <CheckBox
                        style={{ marginVertical: 5, paddingLeft: 10 }}
                        onClick={() => this.handleGivingBonus()}
                        isChecked={this.state.givingClicked}
                        rightText={"Use 'giving' money"}
                        rightTextStyle={{ color: '#000000', fontSize: 12, fontWeight: '200', marginLeft: 5 }}
                        checkedImage={<Image source={require('../../assets/images/ch.jpeg')} style={{ width: 20, height: 20, borderRadius: 10 }} />}
                        unCheckedImage={<Image source={require('../../assets/images/un.jpeg')} style={{ width: 20, height: 20, borderRadius: 10 }} />}
                      />
                      <CheckBox
                        style={{ marginVertical: 5, paddingLeft: 10 }}
                        onClick={() => this.handleSpendingBonus()}
                        isChecked={this.state.spendingClicked}
                        rightText={"Use 'spending' money"}
                        rightTextStyle={{ color: '#000000', fontSize: 12, fontWeight: '200', marginLeft: 5 }}
                        checkedImage={<Image source={require('../../assets/images/ch.jpeg')} style={{ width: 20, height: 20, borderRadius: 10 }} />}
                        unCheckedImage={<Image source={require('../../assets/images/un.jpeg')} style={{ width: 20, backgroundColor: '#fff', height: 20, borderRadius: 10 }} />}
                      />
                    </View>
                  </View>
                  <Text style={styles.error}>
                    {
                      this.state.userBonusError ? this.state.userBonusError : null
                    }
                  </Text>
                </View>
                <View style={[styles.privateWrapper, { marginTop: -15, marginBottom: 15 }]}>
                  <CheckBox
                    style={{ marginVertical: 15 }}
                    onClick={() => this.handlePrivate()}
                    isChecked={this.state.privateClicked}
                    rightText={'Make Private'}
                    rightTextStyle={{ color: '#000000', fontSize: 12, fontWeight: '200', marginLeft: 5 }}
                    checkedImage={<Image source={require('../../assets/images/checked.png')} />}
                    unCheckedImage={<Image source={require('../../assets/images/unchecked.png')} />}
                  />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 100 }}>
                  <Text style={{ fontSize: 15, color: '#27719A' }} onPress={() => { this.props.navigation.goBack() }}>Cancel</Text>
                  <GiveNowBtn
                    marginBottom
                    onPress={() => { this.setState({ disableBtn: true }, () => this.handleGiveNowClick()) }}
                    disabled={this.state.disableBtn}
                  />
                </View>
              </View>
              {
                this.state.serverError ?
                  <ServerError
                    ref="child"
                  /> : null
              }
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </View>
    );
  }
}

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40
  },
  thanksContainer: {
    alignItems: 'stretch',
    backgroundColor: '#d5eff8',
    flex: 1,
    padding: 20,
    paddingBottom: 0
  },
  titleWrapper: {
    backgroundColor: '#d5eff8',
  },
  title: {
    color: '#26709a',
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'Lato-Regular'
  },
  title1: {
    color: '#26709a',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Lato-Regular'
  },
  title2: {
    color: '#26709a',
    fontSize: 15,
    fontStyle: 'italic'
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
    color: "#000000",
    fontSize: 14,
    height: 70,
    paddingHorizontal: 10,
    paddingTop: 10,
    textAlignVertical: "top"
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
    position: "relative",
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
    width: Platform.OS === "ios" ? width - width / 9.5 : width - width / 10,
    height: 152
  },
  valuesDropdownListText: {
    color: "#AAAAAA",
    fontSize: 14
  },
  valuesDropdownCurrentText: {
    color: "#000000",
    fontSize: 14,
    marginLeft: Platform.OS === "ios" ? -3 : 0
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
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10
  },
  bonusInput: {
    backgroundColor: "#FFFFFF",
    color: "#AAAAAA",
    fontSize: 14,
    height: 45,
    flex: 1
  },
  useMoney: {
    flexDirection: "row",
    height: 37,
    justifyContent: "space-between",
    marginTop: 15
  },
  userGivingWrapper: {
    borderRadius: 3,
    borderColor: "transparent",
    borderWidth: 3,
    flexBasis: "48%",
    justifyContent: "flex-start"
  },
  useGiving: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    marginLeft: 5
  },
  givingText: {
    color: "#FFFFFF",
    fontSize: 12
  },
  userSpendingWrapper: {
    borderRadius: 3,
    borderColor: "transparent",
    borderWidth: 3,
    flexBasis: "48%",
    justifyContent: "flex-end"
  },
  useSpending: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    marginLeft: 5
  },
  spendingText: {
    color: "#FFFFFF",
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
    alignItems: "center",
    backgroundColor: "#66C7E5",
    flexDirection: "row",
    borderRadius: 3,
    height: 50,
    justifyContent: "center",
    width: "100%"
  },
  giveNowText: {
    color: "#FFFFFF",
    fontSize: 20
  },
  error: {
    color: "#D50048",
    fontSize: 14,
    marginTop: 5,
    zIndex: -1

  },
  textStyleNew: {
    color: '#000000',
    paddingTop: 7,
    fontSize: 12,
    fontWeight: '200',
    marginLeft: 5,
    zIndex: -1
  }
});
