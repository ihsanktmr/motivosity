import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  Platform
} from 'react-native'

import TaggedInterest from '../TaggedInterest'
import InterestsResult from '../InterestsResult'

export default class InterestsInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activateDropdown: false,
      suggestionTopPos: null
    }
  }

  componentWillReceiveProps(props){
    props.interestsInputClear ? this.clearInterestInput() : null
  }


  clearInterestInput(){
    if (Platform.OS === 'ios') {
      this.interestsInput.setNativeProps({ text: ' ' });
    }
    
    setTimeout(() => {
      this.interestsInput.setNativeProps({ text: '' });
    },5);
  }

  onLayout = event => {
    let {width, height} = event.nativeEvent.layout
    this.setState({suggestionTopPos: height})
  }

  render () {
    const { 
      defaultInterests,
      interestsSuggetions,
      handleXClick,
      clearInput,
      handleInputWord,
      handleKeyboardReturnClick,
      handleInterestClick
  } = this.props
    return(
      <View 
        style={styles.Wrapper} 
        onLayout={this.onLayout}
      >
        {
          defaultInterests.map(
            (interest,key) =>
            <TaggedInterest
              interest={interest.interestName}
              interestId={interest.id}
              key={key}
              index={key}
              onPress={(interestId, interest)=>handleXClick(interestId, interest)}
            />
          )
        }
        <View style={{flexDirection:'row'}}>
          <TextInput
            ref={input => { this.interestsInput = input }}
            blurOnSubmit
            style={styles.input}
            onFocus={() => clearInput()}
            onChangeText={(text) => handleInputWord(text)}
            onSubmitEditing={() => handleKeyboardReturnClick()}
            onFocus={() => this.setState({activateDropdown: true})}
            onBlur={()=> this.setState({activateDropdown: false})}
            placeholder="Type something"
            placeholderTextColor="#DADADA"
            underlineColorAndroid='rgba(0,0,0,0)'
          />
          </View>
          {
            (interestsSuggetions && this.state.activateDropdown) ?
            <View style={[this.state.suggestionTopPos ? [styles.inputWrapper,{top: this.state.suggestionTopPos - 2}] : styles.inputWrapper]}>
              <ScrollView
                style={{height:120}}
                keyboardShouldPersistTaps='handled'
              >
              {
                interestsSuggetions.map(
                (interest,key) =>
                  <InterestsResult
                    interest={interest.interestName}
                    interestId={interest.id}
                    key={key}
                    index={key}
                    resultsLength={interestsSuggetions.length}
                    onPress={(selectedInterestId, selectedInterest) =>
                      handleInterestClick(selectedInterestId, selectedInterest)}
                  />
                  )
              }
              </ScrollView>
            </View>
              : null
          }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  Wrapper: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DDDDDD',
    borderRadius: 5,
    borderWidth: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
    marginTop: 10
  },
  input: {
    color: '#000000',
    flex: 1,
    fontSize: 14,
    paddingVertical: 5,
    paddingRight: 25,
    paddingLeft: 5,
    backgroundColor: '#FFFFFF'
  },
  inputWrapper: {
    position: 'absolute',
    left: -2,
    right: -2,
    top: 24
  }
})