import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Modal,
  TextInput,
  ScrollView
} from 'react-native'

import { Button } from 'react-native-elements'

import Plus1Btn from '../Plus1Btn'

export default class Plus1Modal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        plus1Text: ''
    }
  }

  render () {
    let commentTexts=['Ditto!', 'Way to go!', 'Awesome!', 'Nice!']
    const {
        visible,
        currencyNickname,
        plus1ErrorMsg,
        onRequestClose,
        handlePlus1Submit
      } = this.props
    return(
        <Modal
            animationType="slide"
            style={{position:'relative'}}
            visible={visible}
            onRequestClose={() => onRequestClose()}
        >
            <ScrollView contentContainerStyle={{flex:1}}>
            <View style={styles.wrapper}>
                <View style={{position:'absolute',right: 10,top: 40,zIndex:1}}>
                <TouchableHighlight
                    onPress={() => onRequestClose()}
                    underlayColor="transparent"
                >
                    <Text style={{color:'#000000',fontSize:20,padding:10,zIndex:1000}}>
                    X
                    </Text>
                </TouchableHighlight>
                </View>
            <View style={{alignItems: 'center',marginTop: 50}}>
                <Text style={{fontSize: 20,marginBottom: 10,fontWeight: '900',color: '#61c7e7'}}>
                    Add a {currencyNickname}!
                </Text>
                <Text style={{fontSize: 18}}>
                    Choose your message:
                </Text>
            </View>
            <View style={{flex:0,justifyContent: 'space-around',marginTop: 30}}>
                <View style={{width: '100%',flexDirection: 'row',marginBottom: 20}}>
                    {
                        commentTexts.map((text, key) => 
                            key < 2 ?
                            <Plus1Btn
                                btnTitle={text}
                                key={key}
                                index={key}
                                textColor={'#61C7E7'}
                                backgroundColor={'#FFFFFF'}
                                border={'#61C7E7'}
                                handleDefaultText={(btnText) => this.setState({plus1Text: btnText})}
                            />
                            : null
                        )
                    }
                </View>
                <View style={{width: '100%',flexDirection: 'row'}}>
                    {
                        commentTexts.map((text, key) => 
                            key >= 2 ?
                            <Plus1Btn
                                btnTitle={text}
                                key={key}
                                index={key}
                                textColor={'#61C7E7'}
                                backgroundColor={'#FFFFFF'}
                                border={'#61C7E7'}
                                handleDefaultText={(btnText) => this.setState({plus1Text: btnText})}
                            />
                            : null
                        )
                    }
                </View>
            </View>
            <View style={{flex:1,justifyContent: 'space-between',marginTop: 30}}>
                    <TextInput
                        underlineColorAndroid='rgba(0,0,0,0)'
                        placeholder='or write custom message here...'
                        style={styles.input}
                        multiline
                        value={this.state.plus1Text}
                        onChangeText={(text) => this.setState({plus1Text: text})}
                    />
                    <View style={{flex:1}}>
                        <Text style={styles.error}>
                            {plus1ErrorMsg}
                        </Text>
                    </View>
                <View style={{width: '100%',flexDirection: 'row'}}>
                    <View style={{flex:1}}>
                        <Button
                            title={'Cancel'}
                            color={'#FFFFFF'}
                            onPress={() => onRequestClose()}
                        />
                    </View>
                    <View style={{flex:1}}>
                        <Button
                            title={'OK'}
                            color={'#FFFFFF'}
                            backgroundColor={'#61C7E7'}
                            onPress={(commenttext) => handlePlus1Submit(this.state.plus1Text)}                        
                        />
                    </View>
                </View>
            </View>
           </View>
           </ScrollView>
        </Modal>
    )
  }
}

const styles = StyleSheet.create({
    wrapper: {
        flex:1,
        paddingHorizontal: 10,
        paddingVertical: 50,
        alignItems: 'center'
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#DDDDDD',
        borderRadius: 5,
        color: '#000000',
        height: 100,
        textAlignVertical: "top",
        paddingHorizontal: 10
    },
    error: {
        color: '#D50048',
        fontSize: 14,
        marginTop: 5,
        marginBottom: 10
      },
})
