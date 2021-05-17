import React, { Component } from "react";
import {
  AsyncStorage,
  ActivityIndicator,
  StyleSheet,
  Text,
  View
} from "react-native";

const USER_TOKEN = "user_token";
const USER_REFRESH_TOKEN = "user_refresh_token";
const SURVEY_SNOOZED = "survey_snoozed";
const SURVEY_DATA = "survey_data";

export default class LogOut extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.screenProps.currentScreen === "Logout" &&
      nextProps.screenProps.currentScreen !==
        this.props.screenProps.currentScreen
    ) {
      AsyncStorage.multiRemove(
        [USER_TOKEN, USER_REFRESH_TOKEN, SURVEY_SNOOZED, SURVEY_DATA],
        err => {}
      );
      setTimeout(() => {
        this.setState({ loading: false }, () => {
          nextProps.navigation.navigate("LoginScreen");
        });
      }, 1200);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ alignItems: "stretch", marginTop: 200 }}>
          <Text style={{ color: "#61c7e7", fontSize: 25, textAlign: "center" }}>
            Logging Out. Please Wait!
          </Text>
        </View>
        <ActivityIndicator
          animating={this.state.loading}
          color="#61c7e7"
          style={styles.activityIndicator}
          size="large"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  activityIndicator: {
    marginTop: 80,
    transform: [{ scale: 2.5 }]
  }
});
