import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  ScrollView
} from 'react-native'

import HTMLView from 'react-native-htmlview'

export default class VariableInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      fixedAmount: null,
      selectedOption: null
    }
  }

  identifyModalType(data){
    return data.rewardType === 'TANGO' ? 
      data.terms ? 
      <View style={{flex:1}}>
        <Text style={styles.termsText}>Terms:</Text>
        <HTMLView
          value={data.terms}
          addLineBreaks={false}
          stylesheet={termsInstructions}
        />
      </View> : null   
    : 
      data.description ? 
      <View style={{flex:1}}>
        <Text style={{color:'#000000'}}>
          {data.description}
        </Text>
      </View> : null
  }

  showCurrencyConvert(currencySymbol,selectedItemPrice,foreignCurrencySymbol,foreignCurrencyAmount,currencyCode){
    if(foreignCurrencySymbol != null  || currencySymbol != '$'){
      return foreignCurrencyAmount  ? 
      currencySymbol + selectedItemPrice + ' = ' +  foreignCurrencyAmount + ' ' + currencyCode
      :
      currencySymbol + selectedItemPrice + ' = ' +  selectedItemPrice + ' ' + currencyCode
    }
    else null
  }

  render () {
    const {
      data,
      currencySymbol,
      selectedItemPrice,
      foreignCurrencySymbol,
      foreignCurrencyAmount,
      currencyCode,
      handleInput
    } = this.props
    return(
      <View style={{flex:1}}>
        <Text style={styles.text}>Enter amount below:</Text>
        
        <View style={styles.inputWrapper}>
          {
            <Text style={styles.currencySymbol}>{currencySymbol}</Text>
          }
          <TextInput
            style={styles.input}
            keyboardType={'numeric'}
            placeholder="Amount"
            returnKeyType={'done'}
            placeholderTextColor="#DADADA"
            onChangeText={(val)=> handleInput(val)}
            underlineColorAndroid='rgba(0,0,0,0)'
            />
          </View>
          <Text style={{fontSize: 18}}>
            {
              selectedItemPrice ? this.showCurrencyConvert(currencySymbol,selectedItemPrice,foreignCurrencySymbol,foreignCurrencyAmount,currencyCode) : null    
            }
          </Text>
        <View style={styles.terms}>
          <ScrollView style={{flex:1}}>
            {
              this.identifyModalType(data)
            }
          </ScrollView>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  text: {
    marginBottom: 10,
    fontSize: 15
  },
  inputWrapper: {
    position: 'relative',
    height:45,
    borderColor: '#EDEDED',
    borderWidth: 2,
    borderRadius: 3,
    backgroundColor: '#FFFFFF'
  },
  currencySymbol: {
    bottom: -10,
    fontSize: 18,
    marginLeft: 10,
    color: '#66C7E5'
  },
  input: {
    position: 'absolute',
    bottom: 10,
    marginLeft: 20,
    fontSize: 14,
    width: '92%',
    paddingLeft: 10
  },
  terms: {
    marginVertical: 10,
    flex:1
  },
  termsText: {
    marginBottom: 10
  }
})

const termsInstructions = StyleSheet.create({
  p: {
    color: '#000000'
  },
  a: {
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Lato-Bold',
    textDecorationLine: 'underline'
  },
  ol: {
    color: '#000000',
    marginTop: -40
  },
  li: {
    marginBottom: 20
  }
})