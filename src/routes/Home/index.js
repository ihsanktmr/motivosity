import React, { PureComponent } from "react";
import {
  AsyncStorage,
  StatusBar,
  Alert,
  Image,
  ActivityIndicator,
  View,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  ImageBackground,
} from "react-native";
import Dash from 'react-native-dash';


import axios from "axios";
import { ifIphoneX } from "react-native-iphone-x-helper";

import api from "../../utils/api";
import Utility from "../../utils/Utility";
import { avatarBaseUrl } from "../../utils/images";
var moment = require("moment");
import PlusIcon from "react-native-vector-icons/Entypo";


import ModalDropdown from "react-native-modal-dropdown";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";

import CheckBox from "react-native-check-box";

import { handleTokenExpiration } from "../../utils/tokenExpiration";

import UserSearchInput from "../../components/UserSearchInput";
import DollarInput from "../../components/DollarInput";
import GiveNowBtn from "../../components/GiveNowBtn";
import ServerError from "../../components/ServerError";

const CURRENCY_SYMBOL = "company_currency_symbol";

import SurveyModal from "../../components/SurveyModal";

const USER_TOKEN = "user_token";
const USER_REFRESH_TOKEN = "user_refresh_token";
const SURVEY_SNOOZED = "survey_snoozed";
const SURVEY_DATA = "survey_data";
const CURRENCY_NICKNAME = "company_currency_nickname";

export default class Home extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentUserProfileData: null,
      firstName: "",
      lastName: "",
      title: "",
      thanksData: "",
      peerData: '',
      cashReceiving: "",
      cashGiving: "",
      percent: 0,
      show: false,
      showSurveyModal: false,
      surveyData: null,
    };
    this.timer = null;
  }

  async componentDidMount() {
   this.getCurrentUserProfile()
   console.log('this.componentDidMount')
    !this.props.navigation.state.params
      ? AsyncStorage.getItem(SURVEY_DATA)
        .then(data => {
          this.checkSatSurveySnoozed(JSON.parse(data));
        })
        .catch()
      : this.checkSatSurveySnoozed(
      this.props.navigation.state.params.surveyData
      );

    const { params } = this.props.navigation.state
    setTimeout(() => {
      this.setState({ show: params && params.loginMsg ? true : false })
    }, 10000);
  }

  checkSatSurveySnoozed(surveyData) {
    var currentTime = moment();
    AsyncStorage.multiGet([SURVEY_SNOOZED]).then(data => {
      // Checks if user logged in for the first time
      if (!data[0][1]) {
        this.setState({ showSurveyModal: true }, () => {
          // AsyncStorage.multiSet([[SURVEY_SNOOZED,currentTime]]),
          this.setState({
            surveyData: surveyData,
            showSurveyModal: true
          });
        });
      } else {
        //checks if 3 days passed after user pressed snooze
        currentTime.diff(data[0][1], "days") >= 3
          ? this.setState({
            surveyData: surveyData,
            showSurveyModal: true
          })
          : null; // if 3 days have not passed then modal should not be shown
      }
    });
  }

  async submitSatSurvey(body) {
    delete body.surveyModalOpen;
    delete body.error;
    Object.keys(body).forEach(function (key) {
      key.match("[^%]*.Color") ? delete body[key] : null;
    });
    try {
      const response = await axios.put(api.submitSurvey(), body);
      this.setState(
        {
          showSurveyModal: false,
          surveyData: null
        },
        () => {
          this.removeSurvey();
        }
      );
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
          ? await this.submitSatSurvey(body)
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

  async removeSurvey() {
    try {
      await AsyncStorage.removeItem(SURVEY_DATA);
    } catch (exception) {
      return false;
    }
  }

  async snoozeSurvey() {
    // try {
    //   await AsyncStorage.multiSet([[SURVEY_SNOOZED, moment()]]);
    // } catch (error) {
    //   return false;
    // }
  }

  async componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps')
    if (nextProps.screenProps.currentScreen === 'Home') {
      this.getCompanyValues();
    }
  }

  async getCurrentUserProfile() {
    try {
      const response = await axios.get(api.currentUserProfile());
      this.setState({
        currentUserProfileData: response.data.response,
        fullName: response.data.response.user.fullName,
        lastName: response.data.response.user.lastName,
        title: response.data.response.user.title,
        history: response.data.response.user.history,
        uploadingBackgroundImg: false,
        uploadingProfileImg: false
      });
    } catch (error) {
    } finally {
      this.getLastThanks();
    }

    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.getLastThanks();
      }
    );
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();


  }

  async getCompanyValues() {
    try {
      const response = await axios.get(api.userCash())
      let data = response.data.response
      this.setState({ cashGiving: data.cashGiving, cashReceiving: data.cashReceiving })
    } catch (error) {
    }
  }

  async getLastThanks() {
    try {
      const response = await axios.get(api.getLastThanks());
      this.setState({ thanksData: response.data.response.directreports, peerData: response.data.response.team }, () => {
        const { thanksData } = this.state
        if (thanksData.length) {
          let count = 0
          thanksData.map((val, ind) => {
            if (val.currentMonth) {
              count++
            }
          })
          const percent = (count / thanksData.length * 100).toFixed(2)
          this.setState({ percent })
        }
      });
    } catch (error) {
    }
  }
  popUp = () => {
    // if (this.state.show) {
    //   Alert.alert(
    //     'Login Successfully',
    //     '',
    //     [
    //       { text: 'OK', onPress: () => this.setState({ show: false }) },
    //     ],
    //     { cancelable: false },
    //   );
    // }
    // var fleg = true
    // if (fleg) {
    //   fleg = false
    //   return (
    //     < SCLAlert
    //       theme={"success"}
    //       show={this.state.show}
    //       title={"Login Successfully"}
    //     >
    //       <SCLAlertButton
    //         theme={"success"}
    //         onPress={() => { this.setState({ show: false }) }}
    //       >
    //         OK
    //        </SCLAlertButton>
    //     </SCLAlert >
    //   )

    // }
  }

  renderMoney = (type, data) => {

    if (data) {
      if (JSON.stringify(data).indexOf(".") != -1) {
        if (!type) {
          return JSON.stringify(data).slice(0, JSON.stringify(data).indexOf("."))
        }
        else {
          var d = JSON.stringify(data).slice(JSON.stringify(data).indexOf(".") + 1, JSON.stringify(data).indexOf(".") + 3)
          return d.length == 1 ? d + "0" : d
        }
      }
      else {
        return type ? "00" : data
      }
    }
    else {
      return type ? "00" : 0
    }
  }

  render() {
    const { fullName, currentUserProfileData, title, thanksData, peerData, cashGiving, cashReceiving, percent, show } = this.state;
    return (
      <View style={[styles.container, { backgroundColor: '#fbfbfb' }]}>
        <ScrollView keyboardShouldPersistTaps="handled" >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <View style={{ height: 75, justifyContent: "center", marginTop: 10 }}>
                <View style={styles.LogoHead}>
                  <Text style={{ paddingLeft: 75, fontWeight: "bold", color: "#727272" }}>
                    {fullName}
                  </Text>
                </View>
                <Text
                  style={{
                    paddingHorizontal: 75,
                    fontSize: 14,
                    color: "#727272",
                    paddingTop: 4
                  }}
                >
                  {title ? title.length > 40 ? title.slice(0, 40) + "..." : title : ""}
                </Text>
                <View style={styles.logoImg}>
                  <Image
                    source={require("../../assets/images/mvlogo.png")}
                    style={{ width: 52, height: 52, borderRadius: 6 }}
                  />
                </View>

                <View style={styles.userImg}>
                  {currentUserProfileData ? (
                    <Image
                      source={{
                        uri: avatarBaseUrl + currentUserProfileData.user.avatarUrl
                      }}
                      style={{ width: 52, height: 52, borderRadius: 6 }}
                    />
                  ) : null}
                </View>
              </View>

              <View
                style={{
                  height: 50,
                  backgroundColor: "#addff0",
                  marginTop: 5,
                  flexDirection: "row",
                  alignItems: 'center'
                }}
              >
                <Text
                  style={{
                    flex: 1.7,
                    paddingLeft: 15,
                    fontSize: 14,
                    color: "#FFF",
                    alignSelf: "center"
                  }}
                >
                  You Can Give{" "}
                </Text>
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <Text
                    style={{
                      color: "#FFF",
                      fontWeight: "bold",
                      fontSize: 20,
                      paddingTop: 6.5
                    }}
                  >
                    $
                  </Text>
                  <Text
                    style={{
                      color: "#FFF",
                      fontWeight: "bold",
                      fontSize: 34,
                      paddingHorizontal: 1.5,
                      fontFamily: "Oswald"
                    }}
                  >
                    {this.renderMoney(0, cashGiving)}
                  </Text>
                  {/* <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 20, paddingTop: 6.5 }}>
                    {this.renderMoney(1, cashGiving)}
                  </Text> */}
                </View>
              </View>
              <View
                style={{
                  height: 50,
                  backgroundColor: "#B6D882",
                  marginVertical: 2,
                  flexDirection: "row",
                  alignItems: 'center'
                }}
              >
                <Text
                  style={{
                    flex: 1.7,
                    paddingLeft: 15,
                    fontSize: 14,
                    color: "#FFF",
                    alignSelf: "center"
                  }}
                >
                  You Can Spend{" "}
                </Text>
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <Text
                    style={{
                      color: "#FFF",
                      fontWeight: "bold",
                      fontSize: 20,
                      paddingTop: 6.5
                    }}
                  >
                    $
                  </Text>
                  <Text
                    style={{
                      color: "#FFF",
                      fontWeight: "bold",
                      fontSize: 34,
                      paddingHorizontal: 1.5,
                      fontFamily: "Oswald"
                    }} >
                    {this.renderMoney(0, cashReceiving)}
                  </Text>
                  <Text
                    style={{
                      color: "#FFF",
                      fontWeight: "bold",
                      fontSize: 20,
                      paddingTop: 6.5
                    }}
                  >
                    {this.renderMoney(1, cashReceiving)}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  height: 34,
                  backgroundColor: "#e0e0e0",
                  justifyContent: "center",
                  marginTop: 25
                }}
              >
                <Text
                  style={{
                    paddingLeft: 15,
                    fontWeight: "bold",
                    color: "#727272"
                  }}
                >
                  What do you want to do ?
                </Text>
              </View>

              <View style={{ height: 130, paddingVertical: 10 }}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 6
                  }}
                >
                  <TouchableOpacity
                    style={{ backgroundColor: "#FFF", borderRadius: 6 }}
                    onPress={() => {
                      this.props.navigation.navigate("Thanks");
                    }}
                  >
                    <ImageBackground
                      source={require("../../assets/images/buttonBG.png")}
                      imageStyle={{ borderRadius: 6, backgroundColor: "#57BFE3" }}
                      style={{
                        width: 250,
                        height: 50,
                        justifyContent: "center",
                        borderRadius: 6
                      }}
                    >
                      <Text
                        style={{
                          alignSelf: "center",
                          fontSize: 17,
                          fontWeight: "bold",
                          color: "#fff"
                        }}
                      >
                        Appreciate Someone
                      </Text>
                    </ImageBackground>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 6
                  }}
                >
                  <TouchableOpacity
                    style={{ backgroundColor: "#FFF", borderRadius: 6 }}
                    onPress={() => {
                      this.props.navigation.navigate("Highlight");
                    }}
                  >
                    <ImageBackground
                      source={require("../../assets/images/buttonBG.png")}
                      imageStyle={{
                        borderRadius: 6,
                        backgroundColor: "#5fb346",
                      }}
                      style={{
                        width: 250,
                        height: 50,
                        justifyContent: "center",
                        borderRadius: 6
                      }}
                    >
                      <Text
                        style={{
                          alignSelf: "center",
                          fontSize: 17,
                          borderRadius: 6,
                          fontWeight: "bold",
                          color: "#fff"
                        }}
                      >
                        Share a highlight
                      </Text>
                    </ImageBackground>
                  </TouchableOpacity>
                </View>
              </View>

              <View
                style={{
                  height: 34,
                  backgroundColor: "#e0e0e0",
                  justifyContent: "center",
                  marginTop: 25
                }}
              >
                <Text
                  style={{
                    paddingLeft: 15,
                    fontWeight: "bold",
                    color: "#727272"
                  }}
                >
                  Last Thanked By You
                </Text>
              </View>

              <View style={{ height: 40, justifyContent: "center" }}>
                <Text
                  style={{
                    paddingLeft: 15,
                    fontWeight: "bold",
                    color: "#727272",
                    fontSize: 16,
                    marginTop: 15,
                    paddingBottom: 10,
                  }}
                >
                  Your Direct Reports
                </Text>
              </View>

              {!thanksData ? (

                <View
                  style={{
                    paddingTop: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    height: 30
                  }}
                >
                  <ActivityIndicator size={"small"} color="#57BFE3" />
                </View>
              ) : (
                thanksData.map((val, ind) => {
                  const { avatarUrl, fullName, lastThankedReadableDate, dotColor } = val;
                  let color = Utility.getColor(dotColor);
                  return (
                    <View key={ind}>
                      <View
                        style={thanksData.length - 1 === ind ? styles.lastThanksData : styles.lastThanksDataW}
                      >
                        <View
                          style={{ justifyContent: "center", flexDirection: "row" }}
                        >
                          <Image
                            source={{ uri: avatarBaseUrl + avatarUrl }}
                            style={{ width: 50, height: 50, borderRadius: 6 }}
                          />
                          <View style={{ justifyContent: "center" }}>
                            <Text style={{ paddingLeft: 10, color: "#727272" }}>{fullName}</Text>
                            <View style={{ flexDirection: "row" }}>
                              <Text style={{ paddingLeft: 10, color: "#bfbdbd" }}>
                                Last Thanked
                              </Text>
                              <Text
                                style={{
                                  paddingLeft: 2,
                                  color: "#afaeae",
                                  fontWeight: "bold"
                                }}
                              >
                                {lastThankedReadableDate || "Never :("}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <TouchableOpacity style={{
                          backgroundColor: color,
                          height: 15, width: 15,
                          position: 'absolute',
                          right: 10, borderRadius: 10,
                          alignItems: 'center',
                          justifyContent: "center"
                        }}
                                          onPress={() => {
                                            this.props.navigation.navigate("Thanks", userData = { fullName });
                                          }}
                        >
                          <PlusIcon
                            name="plus"
                            color={"#FFFFFF"}
                            size={13}
                          />
                        </TouchableOpacity>
                      </View>
                      {thanksData.length - 1 === ind ? null : <View style={{ paddingHorizontal: 15 }}><Dash dashThickness={1} dashLength={2} dashColor={"#E1E1E1"} style={{ flex: 1 }} /></View>}

                    </View>
                  );
                })
              )}

              <View style={{
                paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5
                , borderColor: '#E1E1E1', borderBottomWidth: 0.9, borderTopWidth: 0.5, padding: 8, borderRadius: 3, backgroundColor: "#FFF"
              }}>
                <View style={{ alignItems: 'center', justifyContent: 'center' }} >
                  <PlusIcon
                    name="star"
                    color="#B6D882"
                    size={30}
                  />
                </View>
                <View style={{ justifyContent: 'center' }}>
                  <View style={{ flexDirection: "row" }}>

                    <Text style={{
                      fontFamily: "Oswald", fontWeight: 'bold', fontSize: 23, color: "#bfbdbd"
                    }}>{Math.round(percent)}%</Text>
                    <Text style={{ alignSelf: 'flex-end', fontSize: 12, color: "#bfbdbd", paddingBottom: 5 }}> recognized this month</Text>
                  </View>
                </View>
              </View>
              {peerData.length ?
                <View style={{ height: 30, justifyContent: "center" }}>
                  <Text
                    style={{
                      paddingLeft: 15,
                      fontWeight: "bold",
                      color: "#727272",
                      fontSize: 16,
                      // marginBottom:-10
                    }}
                  >
                    Your Peers and Boss
                  </Text>
                </View> : null}
              {!peerData ? (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: 30
                  }}
                >
                  <ActivityIndicator size={"small"} color="#57BFE3" />
                </View>
              ) : (
                peerData.map((val, ind) => {
                  const { avatarUrl, fullName, lastThankedReadableDate, dotColor } = val;
                  let color = Utility.getColor(dotColor);
                  return (
                    <View key={ind}>
                      <View
                        style={peerData.length - 1 == ind ? styles.lastThanksData : styles.lastThanksDataW}
                      >
                        <View
                          style={{ justifyContent: "center", flexDirection: "row" }}
                        >
                          <Image
                            source={{ uri: avatarBaseUrl + avatarUrl }}
                            style={{ width: 50, height: 50, borderRadius: 6 }}
                          />
                          <View style={{ justifyContent: "center" }}>
                            <Text style={{ paddingLeft: 10, color: "#727272" }}>{fullName}</Text>
                            <View style={{ flexDirection: "row" }}>
                              <Text style={{ paddingLeft: 10, color: "#bfbdbd" }}>
                                Last Thanked
                              </Text>
                              <Text
                                style={{
                                  paddingLeft: 2,
                                  color: "#afaeae",
                                  fontWeight: "bold"
                                }}
                              >
                                {lastThankedReadableDate || "Never :("}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <TouchableOpacity style={{
                          backgroundColor: color,
                          height: 15, width: 15,
                          position: 'absolute',
                          right: 10, borderRadius: 10,
                          alignItems: 'center',
                          justifyContent: "center"
                        }}
                                          onPress={() => {
                                            this.props.navigation.navigate("Thanks", userData = { fullName });
                                          }}
                        >
                          <PlusIcon
                            name="plus"
                            color={"#FFFFFF"}
                            size={13}
                          />
                        </TouchableOpacity>

                      </View>
                      {peerData.length - 1 == ind ? null : <View style={{ paddingHorizontal: 15 }}><Dash dashThickness={1} dashLength={2} dashColor={"#E1E1E1"} style={{ flex: 1 }} /></View>}

                    </View>
                  );
                })
              )}
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
        {this.state.surveyData ? (
          <SurveyModal
            showModal={this.state.showSurveyModal}
            data={this.state.surveyData}
            submitSurvey={data => this.submitSatSurvey(data)}
            snoozeSurvey={() => this.snoozeSurvey()}
          />
        ) : null}
      </View>
    );
  }
}

// const width = Dimensions.get('window').width
// const height = Dimensions.get('window').height

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...ifIphoneX(
      {
        marginTop: 20,
        paddingTop: 20
      },
      {
        marginTop: 0
      }
    )
  },
  LogoHead: {
    height: 34,
    backgroundColor: "#e0e0e0",
    justifyContent: "center"
  },
  logoImg: {
    position: "absolute",
    height: 55,
    width: 55,
    left: 10,
    top: 18
  },
  userImg: {
    position: "absolute",
    height: 55,
    width: 55,
    right: 10,
    top: 18
  },
  lastThanksDataW: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    // borderBottomColor: '#E1E1E1',
    // borderBottomWidth: 1,
    marginHorizontal: 15,
    // marginVertical: 5
  },
  lastThanksData: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: '#E1E1E1',
    marginHorizontal: 15,
    // marginVertical: 5
  }

});
