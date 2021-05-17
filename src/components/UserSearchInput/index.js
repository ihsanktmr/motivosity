import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'

import TaggedUser from '../TaggedUser'
import UserSearchResult from  '../UserSearchResult'

import Ionicons from 'react-native-vector-icons/Ionicons'

export default class UserSearchInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hidden: true,
      suggestionTopPos: null
    }
  }

  onLayout = event => {
    let {width, height} = event.nativeEvent.layout
    this.setState({suggestionTopPos: height})
  }

  render () {
    const {
      taggedUser,
      wdyaUserQuery,
      searchUserResults,
      errorMessage,
      handleXClick,
      handleInputWord,
      handleKeyboardReturnClick,
      handleUserSearchClick,
    } = this.props
    return(
      <View style={{marginTop: 20}}>
        <View 
          style={styles.wdyaUserInputWrapper} 
          onLayout={this.onLayout}
        >
          {
            taggedUser.length ?
            taggedUser.map(
              (user,key) =>
              <TaggedUser
                key={key}
                index={key}
                user={taggedUser}
                onPress={(key)=>handleXClick(key)}
                />
            )
            : null
          }
          <View style={{flexDirection:'row'}}>
            <TextInput
              blurOnSubmit
              style={styles.wdyaUserInput}
              onChangeText={text => handleInputWord(text)}
              value={this.props.text}
              onSubmitEditing={()=> handleKeyboardReturnClick()}
              onFocus={() => this.setState({hidden: true})}
              onBlur={()=> this.setState({hidden: false})}
              placeholder="Type a name here"
              placeholderTextColor="#c3c3c3"
              underlineColorAndroid='rgba(0,0,0,0)'
            />
          </View>
            <Ionicons
              name="md-search"
              size={22}
              style={errorMessage ?
                    [styles.searchIcon, {color: '#D50048'}] :
                    [styles.searchIcon]
                    }
            />
        </View>
            {
              errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null
            }
            {
              (wdyaUserQuery && this.state.hidden) ?
              <View style={[styles.inputWrapper,{top: this.state.suggestionTopPos }]}>
                {
                  searchUserResults.map(
                  (user,key) =>
                  <UserSearchResult
                    data={user}
                    key={key}
                    index={key}
                    resultsLength={searchUserResults.length}
                    onPress={(key) => handleUserSearchClick(key)}
                  />
                )
                  }
              </View>
              : null
            }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wdyaUserInputWrapper: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#fff',
    borderRadius: 5,
    borderWidth: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5
  },
  wdyaUserInput: {
    color: '#000000',
    height: 28,
    flex: 1,
    fontSize: 14,
    paddingVertical: 5,
    paddingRight: 25,
    paddingLeft: 5,
    backgroundColor: '#FFFFFF'
  },
  inputWrapper: {
    position: 'absolute',
    left: 1,
    right: 1,
    borderRadius: 1
  },
  searchIcon: {
    top: 8,
    position: 'absolute',
    right: 10,
    color: '#57BFE3',
    transform: [
      { perspective: 850 },
      { translateX: - 0.5 },
      { rotateY: '180deg'},

    ],
    // transform:{scale:'0.5, 0.5'},
    // transform: scaleX(-1)
  },
  error: {
    color: '#D50048',
    fontSize: 14,
    marginTop: 5,
    zIndex: -1
  },
})