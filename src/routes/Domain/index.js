import React, { Component } from "react";
import {
  Alert,
  AsyncStorage,
  Image,
  ActivityIndicator,
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Keyboard,
  Dimensions
} from "react-native";

import axios from "axios";
import api from "../../utils/api";

import ServerError from "../../components/ServerError";

import { Button } from "react-native-elements";

const USER_TOKEN = "user_token";
const USER_REFRESH_TOKEN = "user_refresh_token";
const CURRENCY_SYMBOL = "company_currency_symbol";
const CURRENCY_NICKNAME = "company_currency_nickname";

const { width, height } = Dimensions.get("window");

export default class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
      error: "",
      accessToken: null,
      refreshToken: null,
      serverError: false,
      isload: false
    };
  }

  static navigationOptions = {
    drawerLabel: () => null,
    header: null
  };

  async logUserIn() {
    let body = {
      username: this.state.username,
      password: this.state.password
    };

    try {
      const response = await axios.post(api.userSignInUrl(), body);
      this.checkTokenValidity(response.data);
    } catch (error) {
      if (error.response.status >= 500) {
        this.setState(
          {
            serverError: true
          },
          () => this.triggerChildAlert()
        );
      }
    }
  }

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
    this.props.navigation.navigate("Drawer", { surveyData });
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
        [{ text: "OK", onPress: () => true}],
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

 

  checkDomain = async () => {
    const { email } = this.state;
    this.setState({ isload: true });
    try {
      const url = `https://app.motivosity.com/auth/v1/sso?email=${email}&redirect_uri=motivosity://auth`;
      const rawResponse = await fetch(url);
      if (rawResponse.status == 200) {
        this.setState({ isload: false });
        this.props.navigation.navigate("IDPwebView", {
          domain: url
        });
      } else {
        const response = await rawResponse.json();
        if (!response.success) {
          this.setState({ isload: false });
          this.props.navigation.navigate("LoginScreen", { email });
        } else {
          throw response;
        }
      }
    } catch (error) {
      this.setState({ isload: false });
      alert("Somthing Went Wrong! try again!");
    }
  };

  chechingDomain = () => {
    const { domain } = this.state;
    var data = domain.substr(domain.length - 2);
    if (data == "mv") {
      this.props.navigation.navigate("IDPwebView");
    } else {
      this.props.navigation.navigate("LoginScreen");
    }
  };

  render() {
    const { isload } = this.state;
    return (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flex: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/mvlogo.png")}
              style={{
                height: 80,
                width: 80,
                marginBottom: 20,
                borderRadius: 3
              }}
            />
          </View>
          <View style={{ flex: 5, alignItems: "center" }}>
            <View style={styles.inputWrapper}>
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
              <View style={{ alignItems: "center" }}>
                <TextInput
                  autoCapitalize="none"
                  placeholder="Email"
                  placeholderTextColor="gray"
                  onChangeText={email => this.setState({ email })}
                  value={this.state.email}
                  style={styles.input}
                  underlineColorAndroid="rgba(0,0,0,0)"
                />
                <Button
                  buttonStyle={styles.button}
                  color={"#FFFFFF"}
                  textStyle={{ fontWeight: "700" }}
                  // onPress={() => this.props.navigation.navigate('IDPwebView')}
                  onPress={this.checkDomain}
                  title={"CONTINUE"}
                  underlayColor="#FFFFFF"
                />
              </View>
              {isload && <ActivityIndicator size={"small"} color="#fff" />}
            </View>
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
    flex: 1,
    justifyContent: "center",
    padding: 20
  },
  logoContainer: {
    alignItems: "center",
    flex: 5,
    justifyContent: "center"
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
    // height: 170,

    // justifyContent: 'space-between',
    marginBottom: 30
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 3,
    borderWidth: 0.7,
    borderColor: "#c8c9c7",
    fontSize: 16,
    height: 53,
    width: width * 0.9,
    paddingHorizontal: 5,
    paddingVertical: 10,
    marginBottom: height * 0.04
  },
  button: {
    alignSelf: "stretch",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    padding: 10,
    width: "100%",
    width: width * 0.9,
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
