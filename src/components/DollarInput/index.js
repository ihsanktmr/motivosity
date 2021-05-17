import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput
} from 'react-native'

export default class DollarInput extends Component {
  constructor() {
    super()
  }

  componentWillReceiveProps(props){
    props.bonusInputClear ? this.bonusInput.clear() : null
  }

  render() {
    const {
      bonusAmount,
      currencySymbol,
      storeBonusAmount,
      bonusInputClear,
      clearInput
    } = this.props
    return (
      <View style={styles.inputWrapper}>
        {
          <Text style={styles.currencySymbol}>{currencySymbol}</Text>
        }
        <TextInput
          style={styles.input}
          keyboardType={'numeric'}
          returnKeyType={'done'}
          // placeholder='0'
          defaultValue={bonusAmount.toString()}
          placeholderTextColor="#c3c3c3"
          ref={input => { this.bonusInput = input }}
          onChangeText={number => storeBonusAmount(number)}
          onFocus={() => clearInput()}
          underlineColorAndroid='rgba(0,0,0,0)'
          />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  inputWrapper: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop:10,
    height:40,
    width:100
  },
  currencySymbol: {
    fontSize: 18,
    marginLeft: 10,
    color: '#66C7E5', 
  },
  input: {
    backgroundColor: '#FFFFFF',
    color: '#000000',
    fontSize: 14,
    flex:1,
    marginLeft: 4,
    // paddingBottom:-1
  },
})