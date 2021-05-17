import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  Platform
} from 'react-native'

import TaggedResponsibility from '../TaggedResponsibility'
import ResponsibilitiesResult from '../ResponsibilitiesResult'

export default class ResponsibilitiesInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activateDropdown: false
    }
  }

  componentWillReceiveProps(props){
    props.responsibilitiesInputClear ? this.clearResponsibilityInput() : null
  }


  clearResponsibilityInput(){
    if (Platform.OS === 'ios') {
      this.responsibilitiesInput.setNativeProps({ text: ' ' });
    }
    
    setTimeout(() => {
      this.responsibilitiesInput.setNativeProps({ text: '' });
    },5);
  }

  onLayout = event => {
    let {width, height} = event.nativeEvent.layout
    this.setState({suggestionTopPos: height})
  }

  render () {
    const {
      defaultResponsibilities,
      handleXClick,
      clearInput,
      handleInputWord,
      responsibilitiesSuggetions,
      handleKeyboardReturnClick,
      handleResponsibilityClick
    } = this.props
    return(
        <View 
          style={styles.Wrapper} 
          onLayout={this.onLayout}
        >
          {
            defaultResponsibilities.map(
              (responsibility,key) =>
              <TaggedResponsibility
                responsibility={responsibility.responsibilityName}
                responsibilityId={responsibility.id}
                key={key}
                index={key}
                onPress={(responsibilityId, responsibility)=>handleXClick(responsibilityId, responsibility)}
              />
            )
          }
          <View style={{flexDirection:'row'}}>
            <TextInput
              ref={input => { this.responsibilitiesInput = input }}
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
              (responsibilitiesSuggetions && this.state.activateDropdown) ?
              <View style={[this.state.suggestionTopPos ? [styles.inputWrapper,{top: this.state.suggestionTopPos - 2}] : styles.inputWrapper]}>
                <ScrollView
                  style={{height:80}}
                  keyboardShouldPersistTaps='handled'
                >
                {
                  responsibilitiesSuggetions.map(
                  (responsibility,key) =>
                  <ResponsibilitiesResult
                    responsibility={responsibility.responsibilityName}
                    responsibilityId={responsibility.id}
                    key={key}
                    index={key}
                    resultsLength={responsibilitiesSuggetions.length}
                    onPress={(selectedResponsibilityId, selectedResponsibility) =>
                      handleResponsibilityClick(selectedResponsibilityId, selectedResponsibility)}
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