import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  ScrollView
} from 'react-native'

import ModalDropdown from 'react-native-modal-dropdown'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'

import HTMLView from 'react-native-htmlview'

export default class FixedDropdown extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      optionsDropdownClicked: false,
      optionsData: this.props.data.children,
      selectedOption: null
    }
  }
  componentDidMount(){
    this.props.handleSelect(this.state.optionsData[0])
  }

  optionsIdentification(index,option){
    this.setState({
      selectedOption: option,
    }, () => {
        this.props.handleSelect(this.state.optionsData[index])
    })
  }

  currencyConversion(){
    const {
      data
    } = this.props
    return this.state.optionsData.map(option =>  {
      if (option.currencyCode !== 'USD') {
        var convertedAmount = (Math.floor((option.price * data.exchangeRate)* 100) / 100)
        return option.description + ' ' + '(' + this.props.currencySymbol + convertedAmount +  ')'
        // }
      }
      else {
        return option.description + ' ' + '(' + this.props.currencySymbol + option.price + ')'
      }
  })
  }

  render () {
    var options = this.currencyConversion()
    const {
      data
    } = this.props
    return(
      <View style={{flex:1}}>
        <Text style={styles.text}>Select your choice:</Text>
          <ModalDropdown
            options={options}
            defaultIndex={0}
            style={styles.optionsDropdown}
            dropdownStyle={styles.optionsDropdownList}
            dropdownTextStyle={styles.optionsDropdownListText}
            dropdownTextHighlightStyle={{color: '#000000'}}
            onDropdownWillShow={() => this.setState({optionsDropdownClicked
              : !this.state.optionsDropdownClicked})}
            onDropdownWillHide={() => this.setState({optionsDropdownClicked
              : !this.state.optionsDropdownClicked})}
            onSelect={(index,selectedOption) => this.optionsIdentification(index, selectedOption)}
            >
            <View style={{flexDirection:'row',paddingRight:20}}>
              <Text style={styles.dropdownCurrentText}>
                {this.state.selectedOption ? this.state.selectedOption : options[0]}
              </Text>
              <View style={{position:'absolute',right:0}}>
                {
                  this.state.optionsDropdownClicked ?
                  <SimpleLineIcons name="arrow-up" size={20}/>
                  : <SimpleLineIcons name="arrow-down" size={20}/>
                }
              </View>
            </View>
          </ModalDropdown>
          {
            data.terms ?
            <View style={styles.terms}>
            <ScrollView>
              <Text style={styles.termsText}>Terms:</Text>
              <HTMLView
                value={data.terms}
                addLineBreaks={false}
                stylesheet={termsInstructions}
              />  
            </ScrollView> 
          </View> : null
          }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'left'
  },
  optionsDropdown: {
    borderColor: '#EDEDED',
    borderWidth: 2,
    borderRadius: 3,
    padding: 10,
    position: 'relative',
    marginTop: 10
  },
  optionsDropdownList: {
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderTopWidth: 1,
    borderRightWidth: 2,
    borderColor: '#EDEDED',
    marginTop: 10,
    marginLeft: -12,
    width: 325,
    height: 115
  },
  optionsDropdownListText: {
    color: '#AAAAAA',
    fontSize:14
  },
  dropdownCurrentText: {
    color: '#000000'
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