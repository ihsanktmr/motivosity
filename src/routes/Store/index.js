import React, { Component } from "react";
import {
  AsyncStorage,
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  Dimensions
} from "react-native";
import { ifIphoneX } from 'react-native-iphone-x-helper'

import axios from "axios";
import api from "../../utils/api";

import { handleTokenExpiration } from "../../utils/tokenExpiration";

import StoreItem from "../../components/StoreItem";
import StoreModal from "../../components/StoreModal";
import StoreSuccessModal from "../../components/StoreSuccessModal";
import ServerError from "../../components/ServerError";


const { height, width } = Dimensions.get("window");
const DeviceType = height / width > 1.6 ? "Phone" : "Tablet";

const CURRENCY_SYMBOL = "company_currency_symbol";

export default class Store extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currencySymbol: "$",
      currencyCode: "USD",
      userCashSpending: null,
      digitalItems: [],
      localItems: [],
      charityItems: [],
      modalOpen: false,
      successModalOpen: false,
      selectedItem: null,
      purchasedAmount: null,
      redemptionInstructions: "",
      serverError: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.screenProps.currentScreen === "Store" &&
      nextProps.screenProps.currentScreen !==
        this.props.screenProps.currentScreen
    ) {
      this.setState(
        {
          successModalOpen: false
        },
        () =>
          AsyncStorage.getItem(CURRENCY_SYMBOL).then(data =>
            this.setState({ currencySymbol: data ? data : "$" })
          ),
        this.getUserCash()
      );
    }
  }

  async getUserCash() {
    try {
      const response = await axios.get(api.userCash());
      this.setState(
        {
          userCashSpending: response.data.response.cashReceiving
        },
        () => this.getStoreItems("digital"),
        this.getStoreItems("local"),
        this.getStoreItems("charity")
      );
    } catch (error) {
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

  async getStoreItems(typeOfItem) {
    try {
      const response = await axios.get(
        api.storeItems() + "?type=" + typeOfItem
      );

      switch (typeOfItem) {
        case "digital":
          this.setState({ digitalItems: response.data.response });
          break;
        case "local":
          this.setState({ localItems: response.data.response });
          break;
        case "charity":
          this.setState({ charityItems: response.data.response });
          break;
        default:
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
          ? (await this.getStoreItems("digital"),
            await this.getStoreItems("local"),
            await this.getStoreItems("charity"))
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

  modalVisibility() {
    this.setState({
      modalOpen: !this.state.modalOpen
    });
  }

  successModalVisibility(amount, symbol, code) {
    this.setState({
      successModalOpen: true,
      purchasedAmount: amount,
      currencySymbol: symbol && symbol !== "$" ? symbol : "$",
      currencyCode: code
    });
  }

  handleSuccess(message) {
    this.setState({
      redemptionInstructions: message
    });
  }

  triggerChildAlert() {
    this.refs.child.serverErrorAlert();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            You can spend
            {" " + this.state.currencySymbol}
            {this.state.userCashSpending}
          </Text>
        </View>
        <View style={styles.storeContainer}>
          <ScrollView keyboardShouldPersistTaps="always">
            {this.state.digitalItems.length ? (
              <View style={{ marginTop: 20 }}>
                <View>
                  <Text style={styles.sectionTitle}>E Gifts</Text>
                </View>
                <View
                  style={
                    DeviceType === "Tablet"
                      ? [styles.itemsWrapper, { justifyContent: "flex-start" }]
                      : [
                          styles.itemsWrapper,
                          { justifyContent: "space-around" }
                        ]
                  }
                >
                  {this.state.digitalItems.map((item, key) => (
                    <StoreItem
                      data={item}
                      device={DeviceType}
                      key={key}
                      index={key}
                      onPress={item => {
                        this.setState({ selectedItem: item }, () =>
                          this.modalVisibility()
                        );
                      }}
                    />
                  ))}
                </View>
              </View>
            ) : null}
            {this.state.localItems.length ? (
              <View style={styles.sectionsWrapper}>
                <View>
                  <Text style={styles.sectionTitle}>Local Gifts</Text>
                </View>
                <View
                  style={
                    DeviceType === "Tablet"
                      ? [styles.itemsWrapper, { justifyContent: "flex-start" }]
                      : [
                          styles.itemsWrapper,
                          { justifyContent: "space-around" }
                        ]
                  }
                >
                  {this.state.localItems.map((item, key) => (
                    <StoreItem
                      data={item}
                      device={DeviceType}
                      key={key}
                      index={key}
                      onPress={item => {
                        this.setState({ selectedItem: item }, () =>
                          this.modalVisibility()
                        );
                      }}
                    />
                  ))}
                </View>
              </View>
            ) : null}
            {this.state.charityItems.length ? (
              <View style={styles.sectionsWrapper}>
                <View>
                  <Text style={styles.sectionTitle}>For a Cause</Text>
                </View>
                <View
                  style={
                    DeviceType === "Phone"
                      ? [
                          styles.itemsWrapper,
                          { justifyContent: "space-around" }
                        ]
                      : [styles.itemsWrapper, { justifyContent: "flex-start" }]
                  }
                >
                  {this.state.charityItems.map((item, key) => (
                    <StoreItem
                      data={item}
                      device={DeviceType}
                      key={key}
                      index={key}
                      onPress={item => {
                        this.setState({ selectedItem: item }, () =>
                          this.modalVisibility()
                        );
                      }}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </ScrollView>
          <Modal
            visible={this.state.modalOpen}
            animationType="slide"
            onRequestClose={() => this.modalVisibility()}
          >
            <StoreModal
              data={this.state.selectedItem}
              navigation={this.props.navigation}
              updateUserCash={() => this.getUserCash()}
              modalVisibility={() => this.modalVisibility()}
              successModalVisibility={(amount, symbol, code) =>
                this.successModalVisibility(amount, symbol, code)
              }
              handleSuccess={successMessage =>
                this.handleSuccess(successMessage)
              }
            />
          </Modal>
          <Modal
            style={styles.successModal}
            visible={this.state.successModalOpen}
            animationType="slide"
            onRequestClose={() => this.setState({ successModalOpen: false })}
          >
            <StoreSuccessModal
              data={this.state}
              closeModal={() => this.setState({ successModalOpen: false })}
            />
          </Modal>
        </View>
        {this.state.serverError ? <ServerError ref="child" /> : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...ifIphoneX({
      paddingTop: 40
  }, {
      paddingTop: 20
  })
  },
  storeContainer: {
    alignItems: "stretch",
    backgroundColor: "#EDEDED",
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0
  },
  titleWrapper: {
    backgroundColor: "#61c7e7",
    padding: 15
  },
  title: {
    alignSelf: "center",
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Lato-Bold"
  },
  sectionsWrapper: {
    marginTop: 40
  },
  sectionTitle: {
    fontSize: 18,
    color: "#323232",
    marginBottom: 10
  },
  itemsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap"
  }
});
