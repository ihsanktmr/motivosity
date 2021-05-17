import React, { Component } from "react";
import {
  Alert,
  AsyncStorage,
  Image,
  TouchableHighlight,
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Keyboard,
  Platform,
  Dimensions,
  NativeModules,
  Animated
} from "react-native";

import BackIcon from "react-native-vector-icons/Ionicons";

import axios from "axios";
import api from "../../utils/api";

import ServerError from "../../components/ServerError";

import { Button } from "react-native-elements";

const USER_TOKEN = "user_token";
const USER_REFRESH_TOKEN = "user_refresh_token";
const CURRENCY_SYMBOL = "company_currency_symbol";
const CURRENCY_NICKNAME = "company_currency_nickname";

const { StatusBarManager } = NativeModules;
const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 20 : StatusBarManager.HEIGHT;
const { width, height } = Dimensions.get("window");

export default class Login extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: "",
      error: "",
      accessToken: null,
      refreshToken: null,
      serverError: false,
      checked: false,
      isload: false,
      fadeAnim: new Animated.Value(0)
    };
  }

  static navigationOptions = {
    drawerLabel: () => null,
    header: null
  };

  componentDidMount() {
    Animated.timing(
      // Animate over time
      this.state.fadeAnim, // The animated value to drive
      {
        toValue: 1, // Animate to opacity: 1 (opaque)
        duration: 1000 // Make it take a while
      }
    ).start();
  }

  async logUserIn() {
    const { checked } = this.state;
    Keyboard.dismiss();
    if (!checked) {
      return this.checkDomain();
    }

    let body = {
      username: this.state.username,
      password: this.state.password
    };

    try {
      const response = await axios.post(api.userSignInUrl(), body);
      if (!response.data.success) {
        throw response;
      }

      this.checkTokenValidity(response.data);
    } catch (error) {
      if (error.status >= 500) {
        this.setState(
          {
            serverError: true
          },
          () => this.triggerChildAlert()
        );
      } else {
        Alert.alert(
          "Error!",
          error.data.mvMessages[0].message,
          [{ text: "OK" }],
          { cancelable: false }
        );
      }
    }
  }

  checkDomain = async () => {
    const { username: email } = this.state;
    this.setState({ isload: true });
    /*try {
      const url = `https://app.motivosity.com/auth/v1/sso?email=${email}&redirect_uri=motivosity://auth`;
      const rawResponse = await fetch(url);
      if (rawResponse.status === 200) {
        this.setState({ isload: false });
        this.props.navigation.navigate("IDPwebView", {
          domain: url
        });
      } else {
        const response = await rawResponse.json();
        if (!response.success) {
          this.setState({ checked: true, isload: false });
        } else {
          throw response;
        }
      }
    } catch (error) {
      this.setState({ isload: false });
      alert("Somthing Went Wrong! try again!");
    }*/

    const url = `https://app.motivosity.com/auth/v1/sso?email=${email}&redirect_uri=motivosity://auth`;
    axios.get(url)
      .then(async (rawResponse) => {
        if (rawResponse.status === 200) {
          console.log("ok ??"+rawResponse.data)
          this.setState({ isload: false });
          this.props.navigation.navigate("IDPwebView", {
            domain: url
          });
        }
      })
      .catch((error) => {
        if (!error.response.data.success && error.response.status === 400) {
          this.setState({ checked: true, isload: false });
        } else {
          this.setState({ isload: false });
          alert("Something Went Wrong! try again!");
        }
      })
  };

  async checkTokenValidity(response) {
    if (response.success) {
      await AsyncStorage.multiSet([
        [USER_TOKEN, response.response.accessToken],
        [USER_REFRESH_TOKEN, response.response.refreshToken],
        [CURRENCY_SYMBOL, response.response.currency.currencySymbol],
        [CURRENCY_NICKNAME, response.response.currency.currencyNickname]
      ]);
      await this.changeRoute(
        response.response.accessToken,
        response.response.survey
      );
    } else {
      this.setState({ error: response.mvMessages[0].message });
    }
  }

  changeRoute = (accessToken, surveyData) => {
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    axios.defaults.headers.common["Content-Type"] = "application/json";
    axios.defaults.headers.common["Accept"] = "application/json";
    this.props.navigation.navigate("Home", { surveyData });
  };

  async handlePasswordReset() {
    let body = {
      username: this.state.username
    };
    try {
      const response = await axios.post(api.userResetPassword(), body);

      Alert.alert(
        "Success!",
        `Please follow the link in your email to finish resetting the password.`,
        [{ text: "OK" }],
        { cancelable: false }
      );
    } catch (error) {
      if (error.response.status >= 500) {
        this.setState(
          {
            serverError: true
          },
          () => this.triggerChildAlert()
        );
      } else if (this.state.username.length) {
        this.setState({
          error: error.response.data.mvMessages[0].message
        });
      } else {
        this.setState({
          error: "Please enter your email in Username field"
        });
      }
    }
  }

  triggerChildAlert() {
    this.refs.child.serverErrorAlert();
  }

  render() {
    const { checked, isload, fadeAnim } = this.state;
    return (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flex: 1,
          // paddingTop: STATUSBAR_HEIGHT,
          backgroundColor: "#61c7e7"
        }}
      >
        <View style={styles.container}>
          <BackIcon
            name="ios-arrow-back"
            color="white"
            size={26}
            style={[
              {
                marginTop: Platform.OS == "ios" ? height * 0.05 : height * 0.04
              },
              { marginLeft: width * 0.04 },
              !checked && { opacity: 0 }
            ]}
            onPress={() => this.setState({ checked: false })}
          />
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/mvlogo.png")}
              style={{ height: 60, width: 60 }}
            />
          </View>
          <View style={{ flex: 6 }}>
            <View style={styles.inputWrapper}>
              {/* {checked && (
                <Text style={styles.title}>
                  Sign In with your Motivosity username and password.
                </Text>
              )} */}
              <Text
                style={{
                  fontSize: 14,
                  marginLeft: width * 0.05,
                  marginBottom: height * 0.006,
                  color: "#fff"
                }}
              >
                Enter your email
              </Text>
              <TextInput
                autoCapitalize="none"
                placeholder="Email"
                placeholderTextColor="white"
                onChangeText={username => this.setState({ username })}
                value={this.state.username}
                style={styles.input}
                underlineColorAndroid="rgba(0,0,0,0)"
              />
              {checked && (
                <Animated.View style={{ opacity: fadeAnim }}>
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="white"
                    onChangeText={password => this.setState({ password })}
                    value={this.state.password}
                    style={styles.input}
                    secureTextEntry
                    underlineColorAndroid="rgba(0,0,0,0)"
                  />
                </Animated.View>
              )}
              <Button
                buttonStyle={styles.button}
                color={"#FFFFFF"}
                textStyle={{ fontWeight: "700" }}
                onPress={() => this.logUserIn()}
                title={checked ? "SIGN IN" : "CONTINUE"}
                underlayColor="#FFFFFF"
              />
              {checked && (
                <Animated.View style={{ marginTop: 30, opacity: fadeAnim }}>
                  <TouchableHighlight
                    style={styles.forgotPassword}
                    onPress={() => this.handlePasswordReset()}
                    underlayColor="transparent"
                  >
                    <Text style={styles.forgotBtn}>Forgot your Password?</Text>
                  </TouchableHighlight>
                </Animated.View>
              )}
            </View>
            {isload && <ActivityIndicator size={"small"} color="#fff" />}
            <Text style={styles.error}>{this.state.error}</Text>
          </View>
          {this.state.serverError ? <ServerError ref="child" /> : null}
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "stretch",
    backgroundColor: "#61c7e7",
    flex: 1
  },
  logoContainer: {
    alignItems: "center",
    flex: 3,
    justifyContent: "center"
    // paddingBottom: height * 0.05
  },
  title: {
    alignSelf: "center",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "400",
    marginBottom: 20,
    paddingHorizontal: 40,
    textAlign: "center"
  },
  inputWrapper: {
    // height: 130,
    // justifyContent: "space-between",
    flex: 1,
    marginVertical: 30
  },
  input: {
    backgroundColor: "#3baed1",
    borderRadius: 3,
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 30,
    height: 53,
    marginHorizontal: 15,
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  button: {
    alignSelf: "stretch",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    padding: 10,
    backgroundColor: "transparent"
  },
  forgotBtn: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center"
  },
  error: {
    color: "#D50048",
    fontSize: 14,
    marginTop: 5
  }
});
