import React, { Component } from 'react'
import {
  ActivityIndicator,
  Image,
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  ScrollView,
  Keyboard,
  AsyncStorage
} from 'react-native'

import axios from 'axios'
import api from '../../utils/api'

import FixedDropdown from '../FixedDropdown'
import VariableInput from '../VariableInput'

import { avatarBaseUrl } from '../../utils/images'
import { handleTokenExpiration }  from '../../utils/tokenExpiration'

import { Button } from 'react-native-elements'

import ServerError from  '../../components/ServerError'

const CURRENCY_SYMBOL = 'company_currency_symbol'

export default class StoreModal extends Component {
  constructor() {
    super()
    this.state = {
      currencySymbol: '$',
      foreignCurrencySymbol: null,
      foreignCurrencyAmount: null,
      currencyCode: 'USD',
      selectedItemID: null,
      selectedItemRemoteID: null,
      selectedItemMaxPrice: null,
      selectedItemPrice: null,
      errorMessage: null,
      animating: false,
      buttonDisabled: false,
      serverError: false
    }
  }

  componentDidMount(){
    AsyncStorage.getItem(CURRENCY_SYMBOL).then(data => data ?
      this.setState({currencySymbol: data})
      :
      null
    )
    // if variable price then automatically set id, remoteID and maxPrice
    this.props.data.hasOwnProperty('id') ?
      this.setState({
        selectedItemID: this.props.data.id,
        selectedItemRemoteID: this.props.data.remoteID,
        selectedItemMaxPrice: this.props.data.maxPrice,
      })
      : null
  }

  identifyModalType(data){
    if (data.hasOwnProperty('children')) {
      return (
        <FixedDropdown
          data={data}
          currencySymbol={this.state.currencySymbol}
          handleSelect={(currentOption,currentPrice) => this.handleDropdownSelect(currentOption)}
        />
    )
    }
    else if(data.rewardType === 'LOCAL') {
      return (
        <View style={{alignSelf: 'center'}}>
          <Text style={{fontSize:22}}>Price: ${data.price}
          </Text>
        </View>
      )
    }
    else {
      return(
        <VariableInput
          currencySymbol={this.state.currencySymbol}
          selectedItemPrice={this.state.selectedItemPrice}
          foreignCurrencySymbol={this.state.foreignCurrencySymbol}
          foreignCurrencyAmount={this.state.foreignCurrencyAmount}
          currencyCode={this.state.currencyCode}
          data={data}
          handleInput={(currentOption) => this.handleInputAmount(currentOption)}
          />
      )
    }
  }

  handleDropdownSelect(currentOption){
    this.setState({
      selectedItemID: currentOption.id,
      selectedItemPrice: currentOption.price,
      selectedItemRemoteID: currentOption.remoteID
    })
  }

  handleInputAmount(currentAmount){
    this.setState({
      selectedItemPrice: currentAmount
    }, () => this.currencyConversion(currentAmount))
  }

  currencyConversion(currentAmount) {
    const {
      data,
      handleInput
    } = this.props

    
    const currencySymbol = {
      GBP: '£',
      USD: '$',
      CAD: '$',
      AUD: '$',
      EUR: '€',
      CNY: '¥',
      BRL: 'R$',
      JPY: '¥',
      INR: '₹'
  };

  if (data.currencyCode !== 'USD' && !isNaN(parseInt(currentAmount))) {
    if (data.exchangeRate == 0 || isNaN(currentAmount / data.exchangeRate)) {
      this.setState({
        foreignCurrencySymbol: null,
        foreignCurrencyAmount: null,
        currencyCode: null
      })
      }
    else{
      this.setState({
        foreignCurrencySymbol: currencySymbol[data.currencyCode],
        foreignCurrencyAmount: (Math.floor((currentAmount / data.exchangeRate)* 100) / 100),
        currencyCode: data.currencyCode
      })
    }
  }
  else {
      if (data.exchangeRate == 0 || isNaN(currentAmount / data.exchangeRate) || this.state.currencySymbol == '$') {
        this.setState({
          currencyCode: null
        })
      }
      else{
        this.setState({
          currencyCode: data.currencyCode,
          foreignCurrencySymbol: currencySymbol[data.currencyCode]
        })
      }
  }
  }

  handleBuyNowClick(data){
    Keyboard.dismiss()
    if (data.rewardType === 'LOCAL') {
      this.setState({
        selectedItemPrice: data.price
      }, () => this.localPricePurchase(data))
    }
    else if(this.state.selectedItemMaxPrice){
      this.variablePricePurchase(data)
    }
    else{
      this.fixedPricePurchase(data)
    }
  }

  async variablePricePurchase(data){
    let body = {
      id: this.state.selectedItemID,
      maxPrice: this.state.selectedItemMaxPrice,
      userRedeemPrice: this.state.selectedItemPrice,
      remoteID: this.state.selectedItemRemoteID
    }
    try {
      const response = await axios.post(api.purchaseStoreItems(), body)
        this.setState({
          animating: false,
          buttonDisabled: false
        },() => this.props.handleSuccess(response.data.response))
        this.props.updateUserCash()
        this.props.modalVisibility()
        this.props.successModalVisibility(
          this.state.foreignCurrencyAmount ? this.state.foreignCurrencyAmount : this.state.selectedItemPrice,
          this.state.foreignCurrencySymbol ? this.state.foreignCurrencySymbol: this.state.currencySymbol,
          this.state.currencyCode ? this.state.currencyCode : 'USD'
        )  
      } catch (error) {
      if(error.response.status === 401){
        const tokenError = await handleTokenExpiration()
        !tokenError ? await this.variablePricePurchase(data)
        : 
        this.setState({
          serverError: true
        }, () => this.triggerChildAlert(), setTimeout(()=>{this.props.navigation.navigate('Logout')}, 4000))
      }
      else if(error.response.status > 500)
      {
        this.setState({
          serverError: true,
          animating: false,
          buttonDisabled: false
        }, () => this.triggerChildAlert())
      }
      else{
        this.setState({
          errorMessage: error.response.data.mvMessages[0].message,
          animating: false,
          buttonDisabled: false
        })
      }
    }
  }

  async fixedPricePurchase(data){
    let body = {
      id: this.state.selectedItemID,
      price: this.state.selectedItemPrice,
      remoteID: this.state.selectedItemRemoteID
    }

    const currencySymbol = {
      GBP: '£',
      USD: '$',
      CAD: '$',
      AUD: '$',
      EUR: '€',
      CNY: '¥',
      BRL: 'R$',
      JPY: '¥',
      INR: '₹'
  }

    try {
      const response = await axios.post(api.purchaseStoreItems(), body)

        this.setState({
          animating: false,
          buttonDisabled: false
        },() => this.props.handleSuccess(response.data.response))
        this.props.updateUserCash()
        this.props.modalVisibility()
        this.props.successModalVisibility(
          this.state.foreignCurrencyAmount ? this.state.foreignCurrencyAmount : this.state.selectedItemPrice,
          this.state.foreignCurrencySymbol ? this.state.foreignCurrencySymbol: this.state.currencySymbol,
          this.state.currencyCode ? this.state.currencyCode : 'USD'
        )

      } catch (error) {
        if(error.response.status === 401){
          const tokenError = await handleTokenExpiration()
          !tokenError ? await this.fixedPricePurchase(data)
          : 
          this.setState({
            serverError: true
          }, () => this.triggerChildAlert(), setTimeout(()=>{this.props.navigation.navigate('Logout')}, 4000))
        }
        else if(error.response.status >= 500)
        {
          this.setState({
            serverError: true,
            animating: false,
            buttonDisabled: false
          }, () => this.triggerChildAlert())
        }
        else{
          this.setState({
            errorMessage: error.response.data.mvMessages[0].message,
            animating: false,
            buttonDisabled: false
          })
        }
      }
  }

  async localPricePurchase(data){
    let body = {
      id: this.state.selectedItemID,
      userRedeemPrice: this.state.selectedItemPrice
    }
    
    try {
      const response = await axios.post(api.purchaseStoreItems(), body)

        this.setState({
          animating: false,
          buttonDisabled: false
        },() => 
        this.props.handleSuccess(response.data.response))
        this.props.updateUserCash()
        this.props.modalVisibility()
        this.props.successModalVisibility(this.state.selectedItemPrice,this.state.currencySymbol)
      } catch (error) {
      if(error.response.status === 401){
        const tokenError = await handleTokenExpiration()
        !tokenError ? await this.localPricePurchase(data)
        : 
        this.setState({
          serverError: true
        }, () => this.triggerChildAlert(), setTimeout(()=>{this.props.navigation.navigate('Logout')}, 4000))
      }
      else if(error.response.status >= 500)
      {
        this.setState({
          serverError: true,
          animating: false,
          buttonDisabled: false
        }, () => this.triggerChildAlert())
      }
      else{
        this.setState({
          errorMessage: error.response.data.mvMessages[0].message,
          animating: false,
          buttonDisabled: false
        })
      }
    }
  }

  triggerChildAlert(){
    this.refs.child.serverErrorAlert();
  }

  render() {
    const {
      data,
      modalVisibility,
      updateUserCash,
      successModalVisibility,
      handleSuccess
    } = this.props
    return (
      <ScrollView
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.modalWrapper}>
          <View style={styles.imageWrapper}>
            <Image
              style={styles.itemImage}
              source={{uri: avatarBaseUrl + data.imageUrl}}
            />
          </View>
          <View style={styles.titleWrapper}>
            <Text style={styles.titleText}>
              {data ? data.name : null}
            </Text>
          </View>
            {
              this.identifyModalType(data)
            }
            {
              this.state.errorMessage ? <Text style={styles.error}>{this.state.errorMessage}</Text> : null
            }  
            <View style={styles.btnsWrapper}>
              <View style={{flex:1,zIndex: -111}}>
                <Button
                  buttonStyle={styles.cancelBtn}
                  textStyle={{textAlign: 'center'}}
                  title={'Cancel'}
                  disabled={this.state.buttonDisabled}
                  onPress={() => modalVisibility()}
                />
              </View>
              <View style={{flex:1,zIndex: -111}}>
                <Button
                  buttonStyle={styles.buyNow}
                  textStyle={{textAlign: 'center'}}
                  title={'Buy Now'}
                  disabled={this.state.buttonDisabled}
                  onPress={() => this.setState({
                    errorMessage: '',
                    animating: true,
                    buttonDisabled: true
                  },() => this.handleBuyNowClick(data))}
                />
              </View>
            </View>
            <View style={this.loadingSpinner}>
              <ActivityIndicator
                animating={this.state.animating}
                color='#61c7e7'
                size="large"
                style={{marginTop: 40}}
              />
            </View>
            {
            this.state.serverError ? 
            <ServerError
            ref="child"
            /> : null
          }
        </View>
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

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    paddingHorizontal: 25,
    paddingVertical: 40
  },
  imageWrapper: {
    alignSelf: 'center',
    borderRadius: 7,
    borderColor: '#BFBFBF',
    borderWidth: 1,
    marginBottom: 20,
    marginTop: 50,
  },
  itemImage: {
    width: 170,
    height: 100,
    borderRadius: 7
  },
  titleWrapper: {
    alignSelf: 'center',
    marginBottom: 80
  },
  titleText: {
    fontSize: 18,
    fontWeight: '300'
  },
  error: {
    color: '#D50048',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10
  },
  loadingSpinner: {
  },
  btnsWrapper: {
    flexDirection: 'row',
    marginTop: 15
  },
  buyNow: {
    backgroundColor: '#66C7E5',
    borderRadius: 3,
    justifyContent: 'center',
    marginRight: -15,
    marginLeft: -10
   
  },
  cancelBtn: {
    backgroundColor: '#929292',
    borderRadius: 3,
    justifyContent: 'center',
    marginLeft: -15,
    marginRight: -10
  },
  buyNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900'
  }
})