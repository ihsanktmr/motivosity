import React, { Component } from "react";
import {
  AsyncStorage,
  FlatList,
  Modal,
  Image,
  Text,
  View,
  RefreshControl,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  AppState
} from "react-native";

var moment = require("moment");
import SurveyModal from "../../components/SurveyModal";
import ServerError from "../../components/ServerError";

import axios from "axios";
import api from "../../utils/api";

import Ionicons from "react-native-vector-icons/Ionicons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";

import ModalDropdown from "react-native-modal-dropdown";

import CheckBox from "react-native-check-box";

import { currentUserUrl, feedUrl, submitSurvey } from "../../utils/api";
import { avatarBaseUrl } from "../../utils/images";
import { handleTokenExpiration } from "../../utils/tokenExpiration";
import CustomIcon from "../../config/icons";

import PostCard from "../../components/PostCard";

const USER_TOKEN = "user_token";
const USER_REFRESH_TOKEN = "user_refresh_token";
const SURVEY_SNOOZED = "survey_snoozed";
const SURVEY_DATA = "survey_data";
const CURRENCY_NICKNAME = "company_currency_nickname";

export default class Recent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currencyNickname: null,
      showSurveyModal: false,
      surveyData: null,
      accessToken: "",
      loading: true,
      firstPageLoad: false,
      currentUserData: null,
      recentFeed: [],
      feedType: [],
      feedScopeValue: "Company",
      feedScope: "CMPY",
      feedScopeClicked: false,
      page: 0,
      showFilterDropdown: false,
      checkboxItemChecked: false,
      feedTypesArray: [
        { value: "Anniversary", label: "ANVY", checked: false },
        { value: "Announcement", label: "ANNC", checked: false },
        { value: "Appreciations", label: "APPR", checked: false },
        { value: "Birthday", label: "BDAY", checked: false },
        { value: "Highlight", label: "HGLT", checked: false },
        { value: "History", label: "ABOT", checked: false },
        { value: "Interest", label: "INST", checked: false },
        { value: "New Hire", label: "GNRL", checked: false },
        { value: "Personality", label: "PRSN", checked: false },
        { value: "Responsibility", label: "RESP", checked: false }
      ],
      disableInfiniteScroll: true,
      refreshing: false,
      appState: AppState.currentState,
      serverError: false
    };
  }

  async componentDidMount() {
    AsyncStorage.getItem(CURRENCY_NICKNAME).then(data =>
      this.setState({ currencyNickname: data })
    );
    !this.props.navigation.state.params
      ? AsyncStorage.getItem(SURVEY_DATA)
        .then(data => {
          this.checkSatSurveySnoozed(JSON.parse(data));
        })
        .catch()
      : this.checkSatSurveySnoozed(
        this.props.navigation.state.params.surveyData
      );

    this.getCurrentUserData();
    AppState.addEventListener("change", this._handleAppStateChange);

    // try {
    //   const response = await axios.get(api.currentUserUrl());
    //   if (!response) {
    //     alert("Oopes.! something went Wrong");
    //     this.props.navigation.navigate("LoginScreen");
    //   }
    // } catch (error) {
    //   alert("Oopes.! something went Wrong");
    //   this.props.navigation.navigate("LoginScreen");
    // }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.screenProps.currentScreen === "Recent" &&
      nextProps.screenProps.currentScreen !==
      this.props.screenProps.currentScreen &&
      this.state.firstPageLoad
    ) {
      AsyncStorage.getItem(CURRENCY_NICKNAME).then(data =>
        this.setState({ currencyNickname: data }, () => this.resetData())
      );
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener("change", this._handleAppStateChange);
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

  _handleAppStateChange = nextAppState => {
    // var currentTime = moment()
    // if(nextAppState === 'active'){
    //   AsyncStorage.multiGet([SURVEY_SNOOZED]).then((data) => {
    //     if (currentTime.diff(data[0][1], 'days') >=3){
    //       this.setState({showSurveyModal: true})
    //     }
    //     else {
    //       this.setState({showSurveyModal: false})
    //     }
    //   })
    // }
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      // var end = moment()
      // end.diff(this.state.appOpeningTime, 'days') >=3 ?
      // this.setState({
      //   showSurveyModal: true,
      //   appOpeningTime: moment()
      // },() => this.resetData())
      this.resetData();
      // :
      // this.setState({
      //   showSurveyModal: false,
      //   appOpeningTime : moment()
      // },() => this.resetData())
    }
    this.setState({ appState: nextAppState });
  };

  resetData() {
    var feedTypesArrayCopy1 = [...this.state.feedTypesArray];
    for (var i = 0; i < feedTypesArrayCopy1.length; i++) {
      feedTypesArrayCopy1[i].checked = false;
    }
    this.setState(
      {
        loading: true,
        recentFeed: [],
        page: 0,
        feedType: [],
        feedTypesArray: feedTypesArrayCopy1,
        likedBy: []
      },
      () => {
        this.renderFeed();
      }
    );
  }

  async getCurrentUserData() {
    try {
      const response = await axios.get(api.currentUserUrl());
      AsyncStorage.multiGet([USER_TOKEN, USER_REFRESH_TOKEN]).then(data => {
        this.setState(
          {
            currentUserData: response.data.response,
            firstPageLoad: true,
            accessToken: data[0][1]
          },
          () => this.renderFeed()
        );
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
          ? await this.getCurrentUserData()
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

  async renderFeed() {
    try {
      const response = await axios.get(
        api.feedUrl() +
        "?like=true&page=" +
        this.state.page +
        "&scope=" +
        this.state.feedScope +
        "&feedTypes=" +
        this.state.feedType
      );
      if (response.data.success) {
        this.setState({
          recentFeed: [...this.state.recentFeed, ...response.data.response],
          refreshing: false,
          loading: false
        });
        if (this.state.recentFeed.length < 15) {
          this.setState({
            disableInfiniteScroll: false,
            refreshing: false,
            loading: false
          });
        }
      }
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
          ? await this.renderFeed()
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

  renderMorePosts() {
    this.setState(
      {
        page: this.state.page + 1
      },
      () => {
        this.renderFeed();
      }
    );
  }

  handleRefresh = () => {
    var feedTypesArrayCopy1 = [...this.state.feedTypesArray];
    for (var i = 0; i < feedTypesArrayCopy1.length; i++) {
      feedTypesArrayCopy1[i].checked = false;
    }
    this.setState(
      {
        recentFeed: [],
        page: 0,
        refreshing: true,
        feedType: [],
        feedTypesArray: feedTypesArrayCopy1,
        likedBy: []
      },
      () => {
        this.renderFeed();
      }
    );
  };

  feedScopeIdentification(index, val) {
    var label = "";
    switch (parseInt(index)) {
      case 0:
        label = "TEAM";
        break;
      case 1:
        label = "EXTM";
        break;
      case 2:
        label = "DEPT";
        break;
      case 3:
        label = "CMPY";
        break;
      default:
        break;
    }
    this.handleFeedSortByScope(label, val);
  }

  handleFeedSortByScope(feedScopeValue, feedScopeLabel) {
    this.setState({
      feedScopeValue: feedScopeLabel,
      feedScope: feedScopeValue
    });
  }

  renderCheckBoxView = () => {
    var feedTypesArrayCopy = [...this.state.feedTypesArray];
    var len = feedTypesArrayCopy.length;
    var views = [];
    for (var i = 0, l = len - 2; i < l; i += 2) {
      views.push(
        <View key={i}>
          <View style={styles.checkboxItem}>
            {this.renderCheckBox(feedTypesArrayCopy[i])}
            {this.renderCheckBox(feedTypesArrayCopy[i + 1])}
          </View>
          <View style={styles.line} />
        </View>
      );
    }
    views.push(
      <View key={len - 1}>
        <View style={styles.checkboxItem}>
          {len % 2 === 0
            ? this.renderCheckBox(feedTypesArrayCopy[len - 2])
            : null}
          {this.renderCheckBox(feedTypesArrayCopy[len - 1])}
        </View>
      </View>
    );
    return views;
  };

  renderCheckBox(currentFeedTypeData) {
    var rightText = currentFeedTypeData.value;
    return (
      <CheckBox
        style={styles.filterCheckbox}
        onClick={() => this.handleFeedSortByType(currentFeedTypeData)}
        isChecked={currentFeedTypeData.checked}
        rightText={rightText}
        rightTextStyle={
          currentFeedTypeData.checked
            ? { color: "#66C7E5" }
            : { color: "#AAAAAA" }
        }
        checkedImage={
          <Image source={require("../../assets/images/checked.png")} />
        }
        unCheckedImage={
          <Image source={require("../../assets/images/unchecked.png")} />
        }
      />
    );
  }

  handleFeedSortByType(currentFeedTypeData) {
    currentFeedTypeData.checked = !currentFeedTypeData.checked;
    if (currentFeedTypeData.checked) {
      this.setState({
        feedType: [...this.state.feedType, currentFeedTypeData.label]
      });
    } else {
      var asd = [...this.state.feedType];
      var uncheckedArray = asd.filter(x => x !== currentFeedTypeData.label);
      this.setState({
        feedType: uncheckedArray
      });
    }
  }

  initiateFilter() {
    this.setState({
      recentFeed: [],
      page: 0,
      showFilterDropdown: !this.state.showFilterDropdown
    });
    this.renderFeed();
  }

  triggerChildAlert() {
    this.refs.child.serverErrorAlert();
  }

  render() {
    let feedScopes = ["Team", "Extended Team", "Department", "Company"];
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableHighlight
            underlayColor="transparent"
            onPress={() => this.props.navigation.navigate("Search")}
          >
            <Ionicons name="md-search" size={22} />
          </TouchableHighlight>
          <TouchableHighlight
            style={styles.filterBy}
            underlayColor="transparent"
            onPress={() =>
              this.setState({
                showFilterDropdown: !this.state.showFilterDropdown
              })
            }
          >
            <View style={styles.showingContentForWrapper}>
              <Text style={styles.showingContentFor}>
                Showing content for your:{" "}
                <Text style={{ fontWeight: "800" }}>
                  {this.state.feedScopeValue}
                </Text>
              </Text>
              <Ionicons
                name="md-arrow-dropdown"
                size={25}
                style={{ marginBottom: -3 }}
              />
            </View>
          </TouchableHighlight>
          <Modal
            transparent
            visible={this.state.showFilterDropdown}
            animationType="none"
            onRequestClose={() =>
              this.setState({
                showFilterDropdown: !this.state.showFilterDropdown
              })
            }
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() =>
                this.setState({
                  showFilterDropdown: !this.state.showFilterDropdown
                })
              }
              style={{ backgroundColor: "transparent", flex: 1 }}
            >
              <TouchableOpacity
                activeOpacity={1}
                style={styles.filterContainer}
              >
                <Text style={styles.scopeFilterTitle}>Show feeds for my</Text>
                <View style={{ position: "relative" }}>
                  <ModalDropdown
                    options={feedScopes}
                    defaultValue={this.state.feedScopeValue}
                    style={styles.scopeDropdown}
                    dropdownStyle={styles.scopeDropdownList}
                    dropdownTextStyle={styles.scopeDropdownListText}
                    onDropdownWillShow={() =>
                      this.setState({
                        feedScopeClicked: !this.state.feedScopeClicked
                      })
                    }
                    onDropdownWillHide={() =>
                      this.setState({
                        feedScopeClicked: !this.state.feedScopeClicked
                      })
                    }
                    onSelect={(index, value) =>
                      this.feedScopeIdentification(index, value)
                    }
                  >
                    <View style={{ flexDirection: "row" }}>
                      <Text style={styles.dropdownCurrentText}>
                        {this.state.feedScopeValue}
                      </Text>
                      <View style={{ position: "absolute", right: 0 }}>
                        {this.state.feedScopeClicked ? (
                          <SimpleLineIcons name="arrow-up" size={20} />
                        ) : (
                            <SimpleLineIcons name="arrow-down" size={20} />
                          )}
                      </View>
                    </View>
                  </ModalDropdown>
                </View>
                <Text style={styles.typeFilterTitle}>Filter by Type</Text>
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  style={styles.typeFilterWrapper}
                >
                  {this.renderCheckBoxView()}
                </ScrollView>
                <View style={styles.filterInitiateWrapper}>
                  <TouchableHighlight
                    underlayColor="transparent"
                    onPress={() => this.initiateFilter()}
                  >
                    <Text style={styles.filterInitiate}>Go!</Text>
                  </TouchableHighlight>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </View>
        {this.state.recentFeed ? (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <FlatList
              data={this.state.recentFeed}
              onEndReached={() =>
                this.state.disableInfiniteScroll ? this.renderMorePosts() : null
              }
              onEndReachedThreshold={0.8}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item, key) => key.toString()}
              style={styles.flatList}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this.handleRefresh}
                  title={"pull to refresh feed"}
                  titleColor={"#66C7E5"}
                  tintColor="#66C7E5"
                  style={{ backgroundColor: "transparent" }}
                />
              }
              renderItem={({ item, index }) => {
                return (
                  <PostCard
                    data={item}
                    currencyNickname={this.state.currencyNickname}
                    userData={this.state.currentUserData}
                    index={index}
                    key={index}
                    navigation={this.props.navigation}
                    userToken={this.state.accessToken}
                    likedBy={
                      item.hasOwnProperty("likes")
                        ? item.likes.map(data => data)
                        : []
                    }
                  />
                );
              }}
            />
          </KeyboardAvoidingView>
        ) : null}
        <View
          style={
            this.state.loading
              ? [styles.preloaderContainer, { zIndex: 100 }]
              : [styles.preloaderContainer, { zIndex: -1 }]
          }
        >
          <ActivityIndicator
            animating={this.state.loading}
            size={"large"}
            color={"#61c7e7"}
          />
        </View>
        {this.state.surveyData ? (
          <SurveyModal
            showModal={this.state.showSurveyModal}
            data={this.state.surveyData}
            submitSurvey={data => this.submitSatSurvey(data)}
            snoozeSurvey={() => this.snoozeSurvey()}
          />
        ) : null}
        {this.state.serverError ? <ServerError ref="child" /> : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F1F1F1",
    flex: 1,
    paddingTop: 25
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingTop: 15,
    paddingBottom: 7
  },
  filterBy: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
    flex: 1
  },
  showingContentForWrapper: {
    flexDirection: "row",
    alignItems: "flex-end"
  },
  showingContentFor: {
    marginRight: 5,
    marginBottom: 5
  },
  filterContainer: {
    backgroundColor: "#FFFFFF",
    zIndex: 1,
    padding: 20,
    position: "absolute",
    right: 12,
    top: Platform.OS === "ios" ? 73 : 50,
    width: 250,
    height: 400,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
  },
  scopeFilterTitle: {
    fontSize: 16,
    fontWeight: "300"
  },
  scopeDropdown: {
    borderColor: "#EDEDED",
    borderWidth: 2,
    borderRadius: 3,
    padding: 10,
    position: "relative",
    marginTop: 10
  },
  scopeDropdownList: {
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderTopWidth: 1,
    borderRightWidth: 2,
    borderColor: "#EDEDED",
    marginTop: 10,
    marginLeft: -12,
    width: 210,
    height: 152
  },
  scopeDropdownListText: {
    color: "#AAAAAA",
    fontSize: 14
  },
  typeFilterTitle: {
    fontSize: 16,
    fontWeight: "300",
    marginTop: 25
  },
  typeFilterWrapper: {
    marginTop: 15,
    marginLeft: -10
  },
  filterCheckbox: {
    flex: 1,
    padding: 10
  },
  filterInitiateWrapper: {
    flexDirection: "row",
    alignSelf: "flex-end",
    paddingTop: 10
  },
  filterInitiate: {
    color: "#66C7E5",
    fontSize: 18
  },
  feedType: {
    borderWidth: 0,
    marginBottom: 20
  },
  preloaderContainer: {
    position: "absolute",
    transform: [{ scale: 1.5 }],
    left: 0,
    right: 0,
    bottom: "50%"
  },
  flatList: {
    backgroundColor: "#F1F1F1"
  }
});
