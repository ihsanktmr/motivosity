import React, { Component } from "react";
import {
  View,
  StatusBar,
  Platform,
  NativeModules,
  StyleSheet,
  Dimensions,
  AsyncStorage,
  ActivityIndicator,
  Modal,
  Alert
} from "react-native";
import { WebView } from "react-native-webview";
import axios from "axios";
import BackIcon from "react-native-vector-icons/Ionicons";

const { StatusBarManager } = NativeModules;
const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 20 : StatusBarManager.HEIGHT;

const USER_TOKEN = "user_token";
const USER_REFRESH_TOKEN = "user_refresh_token";

const { height, width } = Dimensions.get("window");
export default class IDPwebView extends Component {
  constructor() {
    super();
    this.state = {
      loader: false
    }
  }
  saveAccesstoken = async accessToken => {
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    axios.defaults.headers.common["Content-Type"] = "application/json";
    axios.defaults.headers.common["Accept"] = "application/json";
    this.setState({ loader: false })
    this.props.navigation.navigate("Home", { loginMsg: true });
  };

  async checkTokenValidity(accessToken, refreshToken) {
    await AsyncStorage.multiSet([
      [USER_TOKEN, accessToken],
      [USER_REFRESH_TOKEN, refreshToken]
    ]);
    await this.saveAccesstoken(accessToken);
  }

  checkForToken = navState => {
    if (navState.url.includes("accessToken")) {
      const token = navState.url.slice(
        navState.url.indexOf("access") + 12,
        navState.url.indexOf("refresh") - 1
      );
      const refreshToken = navState.url.slice(
        navState.url.indexOf("refresh") + 13
      );
      this.setState({ loader: true });
      this.checkTokenValidity(token, refreshToken);
    }
  };

  render() {
    const { domain } = this.props.navigation.state.params;
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#61c7e7" barStyle="light-content" />
        {this.setState.loader && <Modal animationType="fade" transparent={true} visible={true}>
          <View style={{ backgroundColor: 'rgba(0,0,0,0.7)', flex: 1, justifyContent: "center" }}>
            <ActivityIndicator size="large" color="#61c7e7" />
          </View>
        </Modal>}
        <View style={{ flex: 1 }}>
          <BackIcon
            name="ios-arrow-back"
            color="white"
            size={30}
            style={styles.backIconStyle}
            onPress={() => this.props.navigation.goBack()}
          />
          <WebView
            source={{ uri: domain }}
            startInLoadingState={true}
            // renderLoading={() => (
            //   <ActivityIndicator size={"small"} color="#61c7e7" />
            // )}
            onShouldStartLoadWithRequest={request => {
              this.checkForToken(request);
              return request.url.startsWith("http");
            }}
            onNavigationStateChange={navState => {
              if (navState.url.includes("accessToken")) {
                const token = navState.url.slice(
                  navState.url.indexOf("access") + 12,
                  navState.url.indexOf("refresh") - 1
                );
                const refreshToken = navState.url.slice(
                  navState.url.indexOf("refresh") + 13
                );
                this.checkTokenValidity(token, refreshToken);
              }
              // Keep track of going back navigation within component
              this.canGoBack = navState.canGoBack;
            }}
          />
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: STATUSBAR_HEIGHT,
    backgroundColor: "#61c7e7"
  },
  backIconStyle: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#61c7e7",
    marginTop: Platform.OS == "ios" ? height * 0.03 : height * 0.01
  }
});
